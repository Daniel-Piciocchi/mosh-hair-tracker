import type { Snapshot } from '@/types';
import { SnapshotCard } from './snapshot-card.tsx';
import { SnapshotEmptyState } from './snapshot-empty-state.tsx';

interface SnapshotListProps {
  snapshots: Snapshot[];
  onDelete: (id: string) => Promise<void>;
  onSnapshotClick: (snapshot: Snapshot) => void;
  onEdit: (snapshot: Snapshot) => void;
}

function SnapshotList({ snapshots, onDelete, onSnapshotClick, onEdit }: SnapshotListProps) {
  if (snapshots.length === 0) {
    return <SnapshotEmptyState />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {snapshots.map((snapshot) => (
        <SnapshotCard
          key={snapshot.id}
          snapshot={snapshot}
          onDelete={onDelete}
          onClick={onSnapshotClick}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export { SnapshotList };
export type { SnapshotListProps };
