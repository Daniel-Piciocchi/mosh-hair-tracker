import { Button } from '@/components/ui';

interface CameraPermissionDeniedProps {
  onRetry?: () => void;
}

function CameraPermissionDenied({ onRetry }: CameraPermissionDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-gray-100 p-8 text-center">
      <div className="text-4xl">📷</div>
      <h3 className="text-lg font-semibold text-gray-900">
        Camera Access Required
      </h3>
      <p className="max-w-md text-gray-600">
        Please allow camera access in your browser settings to take photos for
        your hair tracking snapshots.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Try Again
        </Button>
      )}
    </div>
  );
}

export { CameraPermissionDenied };
export type { CameraPermissionDeniedProps };
