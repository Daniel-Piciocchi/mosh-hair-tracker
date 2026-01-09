import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSnapshots } from '@/hooks';
import { SnapshotList, SnapshotModal, Button, Spinner, ErrorMessage } from '@/components';
import type { Snapshot } from '@/types';

function HomePage() {
  const { snapshots, isLoading, error, updateSnapshot, deleteSnapshot } = useSnapshots();
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);

  const handleSnapshotClick = (snapshot: Snapshot) => {
    setSelectedSnapshot(snapshot);
  };

  const handleCloseModal = () => {
    setSelectedSnapshot(null);
  };

  const handleUpdateFromModal = async (id: string, data: Parameters<typeof updateSnapshot>[1]) => {
    const updated = await updateSnapshot(id, data);
    setSelectedSnapshot(updated);
    return updated;
  };

  const handleDeleteFromModal = async (id: string) => {
    await deleteSnapshot(id);
    setSelectedSnapshot(null);
  };

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mosh-primary text-white font-bold">
                M
              </div>
              <span className="text-lg font-semibold text-mosh-secondary">
                Mosh Hair Tracker
              </span>
            </div>
            <Link to="/new-snapshot">
              <Button variant="primary" className="flex-shrink-0 whitespace-nowrap">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Snapshot
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="page-header">Your Progress</h2>
          <p className="page-subtitle">
            Track your hair treatment journey with regular snapshots
          </p>
        </div>

        {/* Stats Bar */}
        {!isLoading && !error && snapshots.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="card p-4">
              <p className="text-sm text-gray-500">Total Snapshots</p>
              <p className="text-2xl font-bold text-mosh-secondary">{snapshots.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500">Latest</p>
              <p className="text-2xl font-bold text-mosh-secondary">
                {new Date(snapshots[0]?.createdAt ?? '').toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
            <div className="card p-4 hidden sm:block">
              <p className="text-sm text-gray-500">First Snapshot</p>
              <p className="text-2xl font-bold text-mosh-secondary">
                {new Date(snapshots[snapshots.length - 1]?.createdAt ?? '').toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-500">Loading your snapshots...</p>
          </div>
        ) : error ? (
          <ErrorMessage>
            Failed to load snapshots. Please try again later.
          </ErrorMessage>
        ) : (
          <SnapshotList
            snapshots={snapshots}
            onDelete={deleteSnapshot}
            onSnapshotClick={handleSnapshotClick}
            onEdit={handleSnapshotClick}
          />
        )}
      </main>

      {/* Snapshot Detail Modal */}
      {selectedSnapshot && (
        <SnapshotModal
          snapshot={selectedSnapshot}
          onClose={handleCloseModal}
          onUpdate={handleUpdateFromModal}
          onDelete={handleDeleteFromModal}
        />
      )}
    </div>
  );
}

export { HomePage };
