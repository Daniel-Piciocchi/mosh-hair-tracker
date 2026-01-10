import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCamera, useSnapshots, useFaceDetection } from '@/hooks';
import { Camera, Button, Spinner } from '@/components';
import type { PhotoType } from '@/types';

type CaptureStep = 'front' | 'top' | 'review';

function NewSnapshotPage() {
  const navigate = useNavigate();
  const { webcamRef, imageSrc, capture, reset } = useCamera();
  const { createSnapshot } = useSnapshots();
  const { validation, isLoading: isModelLoading, detectFace } = useFaceDetection();

  const [step, setStep] = useState<CaptureStep>('front');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [topPhoto, setTopPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPhotoType: PhotoType = step === 'top' ? 'top' : 'front';

  // Only run face detection for front photos
  const shouldDetectFace = step === 'front' && !imageSrc;

  const handleCapture = () => {
    capture();
  };

  const handleConfirm = () => {
    if (!imageSrc) return;

    if (step === 'front') {
      setFrontPhoto(imageSrc);
      reset();
      setStep('top');
    } else if (step === 'top') {
      setTopPhoto(imageSrc);
      setStep('review');
    }
  };

  const handleRetake = () => {
    reset();
  };

  const handleSubmit = async () => {
    if (!frontPhoto || !topPhoto) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createSnapshot({ frontPhoto, topPhoto });
      navigate('/');
    } catch {
      setError('Failed to save snapshot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOver = () => {
    setFrontPhoto(null);
    setTopPhoto(null);
    reset();
    setStep('front');
  };

  const handleVideoFrame = (video: HTMLVideoElement) => {
    if (shouldDetectFace) {
      detectFace(video);
    }
  };

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-mosh-primary transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="text-lg font-semibold text-mosh-secondary">
              New Snapshot
            </h1>
            <div className="w-14" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2">
            <StepIndicator
              number={1}
              label="Front"
              status={step === 'front' ? 'current' : frontPhoto ? 'complete' : 'upcoming'}
            />
            <div className={`h-0.5 w-12 ${frontPhoto ? 'bg-mosh-primary' : 'bg-gray-200'}`} />
            <StepIndicator
              number={2}
              label="Top"
              status={step === 'top' ? 'current' : topPhoto ? 'complete' : 'upcoming'}
            />
            <div className={`h-0.5 w-12 ${topPhoto ? 'bg-mosh-primary' : 'bg-gray-200'}`} />
            <StepIndicator
              number={3}
              label="Review"
              status={step === 'review' ? 'current' : 'upcoming'}
            />
          </div>
        </div>

        {step !== 'review' && (
          <div className="card-elevated overflow-hidden">
            {/* Step Header */}
            <div className="bg-linear-to-r from-mosh-primary to-teal-500 px-6 py-4 text-white">
              <h2 className="text-xl font-semibold">
                {step === 'front' ? 'Front View Photo' : 'Top View Photo'}
              </h2>
              <p className="mt-1 text-white/80 text-sm">
                {step === 'front'
                  ? 'Look directly at the camera with your face centered'
                  : 'Tilt your head forward to show the top of your head'}
              </p>
            </div>

            {/* Camera / Preview */}
            <div className="p-4">
              {imageSrc ? (
                <div className="overflow-hidden rounded-xl border-2 border-green-400">
                  <img
                    src={imageSrc}
                    alt={`${currentPhotoType} preview`}
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl">
                  <Camera
                    webcamRef={webcamRef}
                    photoType={currentPhotoType}
                    validation={shouldDetectFace ? validation : undefined}
                    isModelLoading={shouldDetectFace ? isModelLoading : false}
                    onVideoFrame={shouldDetectFace ? handleVideoFrame : undefined}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
              {imageSrc ? (
                <div className="flex justify-center gap-3">
                  <Button variant="secondary" onClick={handleRetake}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retake
                  </Button>
                  <Button variant="primary" onClick={handleConfirm}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Use This Photo
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCapture}
                    disabled={isModelLoading && shouldDetectFace}
                  >
                    {isModelLoading && shouldDetectFace ? (
                      <>
                        <Spinner size="sm" /> Loading AI...
                      </>
                    ) : (
                      <>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Capture Photo
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'review' && frontPhoto && topPhoto && (
          <div className="card-elevated overflow-hidden">
            {/* Review Header */}
            <div className="bg-linear-to-r from-mosh-primary to-teal-500 px-6 py-4 text-white">
              <h2 className="text-xl font-semibold">Review Your Snapshot</h2>
              <p className="mt-1 text-white/80 text-sm">
                Make sure both photos look good before saving
              </p>
            </div>

            {/* Photos Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                    <img src={frontPhoto} alt="Front view" className="w-full" />
                  </div>
                  <p className="text-center text-sm font-medium text-gray-600">Front View</p>
                </div>
                <div className="space-y-2">
                  <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                    <img src={topPhoto} alt="Top view" className="w-full" />
                  </div>
                  <p className="text-center text-sm font-medium text-gray-600">Top View</p>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-center text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex justify-center gap-3">
                <Button
                  variant="secondary"
                  onClick={handleStartOver}
                  disabled={isSubmitting}
                >
                  Start Over
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" /> Saving...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Snapshot
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

interface StepIndicatorProps {
  number: number;
  label: string;
  status: 'upcoming' | 'current' | 'complete';
}

function StepIndicator({ number, label, status }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
          status === 'complete'
            ? 'bg-mosh-primary text-white'
            : status === 'current'
              ? 'bg-mosh-primary text-white ring-4 ring-mosh-primary/20'
              : 'bg-gray-200 text-gray-500'
        }`}
      >
        {status === 'complete' ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          number
        )}
      </div>
      <span className={`text-xs font-medium ${status === 'upcoming' ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
}

export { NewSnapshotPage };
