import { useEffect, useRef, useState } from 'react';
import type { Snapshot, UpdateSnapshotRequest } from '@/types';
import { Button, Spinner } from '@/components/ui';
import { formatDate } from '@/lib';

interface SnapshotModalProps {
  snapshot: Snapshot;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateSnapshotRequest) => Promise<Snapshot>;
  onDelete: (id: string) => Promise<void>;
}

function SnapshotModal({ snapshot, onClose, onUpdate, onDelete }: SnapshotModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(snapshot.notes);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open dialog on mount
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  // Handle native dialog close (ESC key)
  const handleDialogClose = () => {
    if (!isEditing) {
      onClose();
    } else {
      // Prevent close when editing - reopen the dialog
      dialogRef.current?.showModal();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current && !isEditing) {
      onClose();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(snapshot.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await onUpdate(snapshot.id, { notes });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNotes(snapshot.notes);
    setIsEditing(false);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleDialogClose}
      onClick={handleBackdropClick}
      className="w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm p-0 m-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-mosh-secondary">
            Snapshot Details
          </h2>
          <p className="text-sm text-gray-500">
            {formatDate(snapshot.createdAt)} at{' '}
            {new Date(snapshot.createdAt).toLocaleTimeString('en-AU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
          disabled={isEditing}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Photos */}
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Front Photo */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-500">Front View</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img
                src={snapshot.frontPhoto.imageData}
                alt="Front view"
                className="w-full"
              />
            </div>
          </div>

          {/* Top Photo */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-500">Top View</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img
                src={snapshot.topPhoto.imageData}
                alt="Top view"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-mosh-primary hover:text-mosh-primary-dark transition-colors"
              >
                {snapshot.notes ? 'Edit' : 'Add notes'}
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this snapshot..."
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-mosh-primary focus:outline-none focus:ring-2 focus:ring-mosh-primary/20 resize-none"
                rows={4}
                maxLength={1000}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{notes.length}/1000</span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSaveNotes} disabled={isSaving}>
                    {isSaving ? <><Spinner size="sm" /> Saving...</> : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 min-h-20">
              {snapshot.notes ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{snapshot.notes}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No notes added yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
        <Button variant="secondary" onClick={onClose} disabled={isEditing}>
          Close
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={isEditing || isDeleting}>
          {isDeleting ? (
            <><Spinner size="sm" /> Deleting...</>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Snapshot
            </>
          )}
        </Button>
      </div>
    </dialog>
  );
}

export { SnapshotModal };
export type { SnapshotModalProps };
