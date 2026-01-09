import { useState, useRef, useCallback } from 'react';
import type Webcam from 'react-webcam';

export interface UseCameraReturn {
  webcamRef: React.RefObject<Webcam | null>;
  imageSrc: string | null;
  isCapturing: boolean;
  capture: () => void;
  reset: () => void;
}

export function useCamera(): UseCameraReturn {
  const webcamRef = useRef<Webcam | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      setIsCapturing(true);
      const screenshot = webcamRef.current.getScreenshot();
      setImageSrc(screenshot);
      setIsCapturing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setImageSrc(null);
  }, []);

  return {
    webcamRef,
    imageSrc,
    isCapturing,
    capture,
    reset,
  };
}
