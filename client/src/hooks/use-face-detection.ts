import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaceDetector,
  FilesetResolver,
  type Detection,
} from '@mediapipe/tasks-vision';

export type PositionFeedback =
  | 'perfect'
  | 'move_closer'
  | 'move_back'
  | 'move_left'
  | 'move_right'
  | 'move_up'
  | 'move_down';

export type LightingFeedback =
  | 'perfect'
  | 'too_dark'
  | 'too_bright'
  | 'uneven_left'
  | 'uneven_right';

export interface FaceValidation {
  isValid: boolean;
  isFaceDetected: boolean;
  isPositionValid: boolean;
  isLightingValid: boolean;
  feedback: {
    position: PositionFeedback | null;
    lighting: LightingFeedback | null;
  };
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export interface UseFaceDetectionReturn {
  validation: FaceValidation;
  isLoading: boolean;
  isModelLoaded: boolean;
  detectFace: (video: HTMLVideoElement) => void;
}

// Ideal positioning thresholds (as percentage of frame)
const IDEAL_FACE_SIZE_MIN = 0.25; // Face should be at least 25% of frame width
const IDEAL_FACE_SIZE_MAX = 0.55; // Face should be at most 55% of frame width
const CENTER_TOLERANCE = 0.15; // How far from center is acceptable (15%)
const BRIGHTNESS_MIN = 80; // Minimum average brightness (0-255)
const BRIGHTNESS_MAX = 200; // Maximum average brightness
const BRIGHTNESS_VARIANCE_MAX = 50; // Max allowed difference between left/right

function analyzePosition(
  detection: Detection,
  frameWidth: number,
  frameHeight: number
): { isValid: boolean; feedback: PositionFeedback } {
  const bbox = detection.boundingBox;
  if (!bbox) {
    return { isValid: false, feedback: 'move_closer' };
  }

  const faceCenterX = bbox.originX + bbox.width / 2;
  const faceCenterY = bbox.originY + bbox.height / 2;
  const frameCenterX = frameWidth / 2;
  const frameCenterY = frameHeight / 2;

  // Normalize to percentages
  const faceWidthRatio = bbox.width / frameWidth;
  const offsetX = (faceCenterX - frameCenterX) / frameWidth;
  const offsetY = (faceCenterY - frameCenterY) / frameHeight;

  // Check size first
  if (faceWidthRatio < IDEAL_FACE_SIZE_MIN) {
    return { isValid: false, feedback: 'move_closer' };
  }
  if (faceWidthRatio > IDEAL_FACE_SIZE_MAX) {
    return { isValid: false, feedback: 'move_back' };
  }

  // Check horizontal position
  if (offsetX < -CENTER_TOLERANCE) {
    return { isValid: false, feedback: 'move_right' };
  }
  if (offsetX > CENTER_TOLERANCE) {
    return { isValid: false, feedback: 'move_left' };
  }

  // Check vertical position
  if (offsetY < -CENTER_TOLERANCE) {
    return { isValid: false, feedback: 'move_down' };
  }
  if (offsetY > CENTER_TOLERANCE) {
    return { isValid: false, feedback: 'move_up' };
  }

  return { isValid: true, feedback: 'perfect' };
}

function analyzeLighting(
  video: HTMLVideoElement,
  detection: Detection
): { isValid: boolean; feedback: LightingFeedback } {
  const bbox = detection.boundingBox;
  if (!bbox) {
    return { isValid: true, feedback: 'perfect' };
  }

  // Create a canvas to analyze the video frame
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { isValid: true, feedback: 'perfect' };
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  // Get face region image data
  const faceX = Math.max(0, Math.floor(bbox.originX));
  const faceY = Math.max(0, Math.floor(bbox.originY));
  const faceWidth = Math.min(Math.floor(bbox.width), canvas.width - faceX);
  const faceHeight = Math.min(Math.floor(bbox.height), canvas.height - faceY);

  if (faceWidth <= 0 || faceHeight <= 0) {
    return { isValid: true, feedback: 'perfect' };
  }

  const imageData = ctx.getImageData(faceX, faceY, faceWidth, faceHeight);
  const pixels = imageData.data;

  // Calculate brightness for left and right halves
  let leftSum = 0;
  let rightSum = 0;
  let leftCount = 0;
  let rightCount = 0;
  const halfWidth = Math.floor(faceWidth / 2);

  for (let y = 0; y < faceHeight; y++) {
    for (let x = 0; x < faceWidth; x++) {
      const i = (y * faceWidth + x) * 4;
      const r = pixels[i] ?? 0;
      const g = pixels[i + 1] ?? 0;
      const b = pixels[i + 2] ?? 0;
      // Perceived brightness formula
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

      if (x < halfWidth) {
        leftSum += brightness;
        leftCount++;
      } else {
        rightSum += brightness;
        rightCount++;
      }
    }
  }

  const leftAvg = leftCount > 0 ? leftSum / leftCount : 0;
  const rightAvg = rightCount > 0 ? rightSum / rightCount : 0;
  const overallAvg = (leftAvg + rightAvg) / 2;

  // Check overall brightness
  if (overallAvg < BRIGHTNESS_MIN) {
    return { isValid: false, feedback: 'too_dark' };
  }
  if (overallAvg > BRIGHTNESS_MAX) {
    return { isValid: false, feedback: 'too_bright' };
  }

  // Check for uneven lighting
  const brightnessDiff = Math.abs(leftAvg - rightAvg);
  if (brightnessDiff > BRIGHTNESS_VARIANCE_MAX) {
    if (leftAvg > rightAvg) {
      return { isValid: false, feedback: 'uneven_right' };
    }
    return { isValid: false, feedback: 'uneven_left' };
  }

  return { isValid: true, feedback: 'perfect' };
}

export function useFaceDetection(): UseFaceDetectionReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [validation, setValidation] = useState<FaceValidation>({
    isValid: false,
    isFaceDetected: false,
    isPositionValid: false,
    isLightingValid: false,
    feedback: {
      position: null,
      lighting: null,
    },
    boundingBox: null,
  });

  const detectorRef = useRef<FaceDetector | null>(null);
  const lastDetectionTimeRef = useRef(0);
  const DETECTION_INTERVAL = 100; // Run detection every 100ms max

  // Initialize the face detector
  useEffect(() => {
    let mounted = true;

    async function initializeDetector() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5,
        });

        if (mounted) {
          detectorRef.current = detector;
          setIsModelLoaded(true);
          setIsLoading(false);
        }
      } catch {
        if (mounted) {
          setIsLoading(false);
          // Still allow usage without face detection
          setValidation((prev) => ({ ...prev, isValid: true }));
        }
      }
    }

    void initializeDetector();

    return () => {
      mounted = false;
      if (detectorRef.current) {
        detectorRef.current.close();
      }
    };
  }, []);

  const detectFace = useCallback((video: HTMLVideoElement) => {
    const now = performance.now();
    if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL) {
      return;
    }
    lastDetectionTimeRef.current = now;

    const detector = detectorRef.current;
    if (!detector || !video.videoWidth || !video.videoHeight) {
      return;
    }

    try {
      const detections = detector.detectForVideo(video, now);

      if (detections.detections.length === 0) {
        setValidation({
          isValid: false,
          isFaceDetected: false,
          isPositionValid: false,
          isLightingValid: false,
          feedback: {
            position: null,
            lighting: null,
          },
          boundingBox: null,
        });
        return;
      }

      // Use the first (most confident) detection
      const detection = detections.detections[0];
      if (!detection) {
        return;
      }

      const positionResult = analyzePosition(
        detection,
        video.videoWidth,
        video.videoHeight
      );
      const lightingResult = analyzeLighting(video, detection);

      const bbox = detection.boundingBox;
      const boundingBox = bbox
        ? {
            x: bbox.originX / video.videoWidth,
            y: bbox.originY / video.videoHeight,
            width: bbox.width / video.videoWidth,
            height: bbox.height / video.videoHeight,
          }
        : null;

      setValidation({
        isValid: positionResult.isValid && lightingResult.isValid,
        isFaceDetected: true,
        isPositionValid: positionResult.isValid,
        isLightingValid: lightingResult.isValid,
        feedback: {
          position: positionResult.feedback,
          lighting: lightingResult.feedback,
        },
        boundingBox,
      });
    } catch {
      // Detection failed, ignore
    }
  }, []);

  return {
    validation,
    isLoading,
    isModelLoaded,
    detectFace,
  };
}
