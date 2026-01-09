import { cn } from '@/lib';
import type { FaceValidation, PositionFeedback, LightingFeedback } from '@/hooks';

interface FaceGuideProps {
  validation: FaceValidation;
  photoType: 'front' | 'top';
  isModelLoading?: boolean;
}

function FaceGuide({ validation, photoType, isModelLoading }: FaceGuideProps) {
  const { isValid, isFaceDetected, feedback, boundingBox } = validation;

  // Determine border color based on validation state
  const getBorderColor = () => {
    if (isModelLoading) return 'border-gray-400';
    if (!isFaceDetected) return 'border-yellow-500';
    if (isValid) return 'border-green-500';
    return 'border-orange-500';
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Center guide oval */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            'border-4 rounded-full transition-colors duration-200',
            photoType === 'front' ? 'h-64 w-48' : 'h-48 w-64',
            getBorderColor()
          )}
        />
      </div>

      {/* Face bounding box (when detected) */}
      {boundingBox && isFaceDetected && (
        <div
          className={cn(
            'absolute border-2 rounded-lg transition-all duration-100',
            isValid ? 'border-green-400' : 'border-orange-400'
          )}
          style={{
            left: `${boundingBox.x * 100}%`,
            top: `${boundingBox.y * 100}%`,
            width: `${boundingBox.width * 100}%`,
            height: `${boundingBox.height * 100}%`,
          }}
        />
      )}

      {/* Status indicator */}
      <div className="absolute left-4 top-4">
        <div
          className={cn(
            'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
            isModelLoading
              ? 'bg-gray-800/80 text-gray-300'
              : isValid
                ? 'bg-green-800/80 text-green-200'
                : 'bg-orange-800/80 text-orange-200'
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isModelLoading
                ? 'animate-pulse bg-gray-400'
                : isValid
                  ? 'bg-green-400'
                  : 'animate-pulse bg-orange-400'
            )}
          />
          {isModelLoading
            ? 'Loading...'
            : isValid
              ? 'Ready'
              : !isFaceDetected
                ? 'No face detected'
                : 'Adjust position'}
        </div>
      </div>

      {/* Feedback messages */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col gap-2">
        {/* Position feedback */}
        {feedback.position && feedback.position !== 'perfect' && (
          <FeedbackBadge type="position" value={feedback.position} />
        )}

        {/* Lighting feedback */}
        {feedback.lighting && feedback.lighting !== 'perfect' && (
          <FeedbackBadge type="lighting" value={feedback.lighting} />
        )}

        {/* Perfect state */}
        {isValid && isFaceDetected && (
          <div className="rounded-lg bg-green-600/90 px-4 py-2 text-center text-sm font-medium text-white">
            Perfect! Ready to capture
          </div>
        )}
      </div>
    </div>
  );
}

interface FeedbackBadgeProps {
  type: 'position' | 'lighting';
  value: PositionFeedback | LightingFeedback;
}

function FeedbackBadge({ type, value }: FeedbackBadgeProps) {
  const positionMessages: Record<PositionFeedback, string> = {
    perfect: '',
    move_closer: 'Move closer to the camera',
    move_back: 'Move back from the camera',
    move_left: 'Move slightly left',
    move_right: 'Move slightly right',
    move_up: 'Move your head up',
    move_down: 'Move your head down',
  };

  const lightingMessages: Record<LightingFeedback, string> = {
    perfect: '',
    too_dark: 'Too dark - add more light',
    too_bright: 'Too bright - reduce light',
    uneven_left: 'Uneven lighting - add light on left',
    uneven_right: 'Uneven lighting - add light on right',
  };

  const message =
    type === 'position'
      ? positionMessages[value as PositionFeedback]
      : lightingMessages[value as LightingFeedback];

  if (!message) return null;

  // Get the appropriate arrow icon for position feedback
  const getPositionIcon = (feedback: PositionFeedback) => {
    switch (feedback) {
      case 'move_closer':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        );
      case 'move_back':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        );
      case 'move_left':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        );
      case 'move_right':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        );
      case 'move_up':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'move_down':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return null;
    }
  };

  const icon = type === 'position'
    ? getPositionIcon(value as PositionFeedback)
    : (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    );

  return (
    <div className="flex items-center gap-2 rounded-lg bg-black/80 px-4 py-2 text-sm text-white">
      <span className="text-orange-400">{icon}</span>
      <span>{message}</span>
    </div>
  );
}

export { FaceGuide };
export type { FaceGuideProps };
