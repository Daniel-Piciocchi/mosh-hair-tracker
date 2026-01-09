import { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import type { RefObject } from 'react';
import { FaceGuide } from './face-guide';
import type { FaceValidation } from '@/hooks';

const VIDEO_CONSTRAINTS = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  facingMode: 'user',
} satisfies MediaTrackConstraints;

interface CameraProps {
  webcamRef: RefObject<Webcam | null>;
  onUserMediaError?: (error: string | DOMException) => void;
  photoType?: 'front' | 'top';
  validation?: FaceValidation | undefined;
  isModelLoading?: boolean | undefined;
  onVideoFrame?: ((video: HTMLVideoElement) => void) | undefined;
}

function Camera({
  webcamRef,
  onUserMediaError,
  photoType = 'front',
  validation,
  isModelLoading,
  onVideoFrame,
}: CameraProps) {
  const animationFrameRef = useRef<number | null>(null);

  // Run face detection on each video frame
  useEffect(() => {
    if (!onVideoFrame) return;

    function processFrame() {
      const video = webcamRef.current?.video;
      if (video && video.readyState === 4 && onVideoFrame) {
        onVideoFrame(video);
      }
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onVideoFrame, webcamRef]);

  const defaultValidation: FaceValidation = {
    isValid: true,
    isFaceDetected: false,
    isPositionValid: true,
    isLightingValid: true,
    feedback: { position: null, lighting: null },
    boundingBox: null,
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-900">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={VIDEO_CONSTRAINTS}
        onUserMediaError={onUserMediaError}
        className="h-full w-full object-cover"
      />
      <FaceGuide
        validation={validation ?? defaultValidation}
        photoType={photoType}
        isModelLoading={isModelLoading ?? false}
      />
    </div>
  );
}

export { Camera };
export type { CameraProps };
