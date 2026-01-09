import { useState } from 'react';
import type { Snapshot } from '@/types';
import { Button } from '@/components/ui';
import { formatDate } from '@/lib';

interface SnapshotCardProps {
  snapshot: Snapshot;
  onDelete: (id: string) => Promise<void>;
  onClick: (snapshot: Snapshot) => void;
  onEdit: (snapshot: Snapshot) => void;
}

function SnapshotCard({ snapshot, onDelete, onClick, onEdit }: SnapshotCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(snapshot.id);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div
      className="group card cursor-pointer overflow-hidden"
      onClick={() => onClick(snapshot)}
    >
      {/* Photos */}
      <div className="grid grid-cols-2 gap-1">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={snapshot.frontPhoto.imageData}
            alt="Front view"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            Front
          </span>
        </div>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={snapshot.topPhoto.imageData}
            alt="Top view"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            Top
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="font-medium text-mosh-secondary">
            {formatDate(snapshot.createdAt)}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(snapshot.createdAt).toLocaleTimeString('en-AU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {showConfirm ? (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancelClick}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Confirm'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(snapshot);
              }}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-mosh-accent hover:text-mosh-primary"
              aria-label="Edit snapshot"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDeleteClick}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Delete snapshot"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export { SnapshotCard };
export type { SnapshotCardProps };
