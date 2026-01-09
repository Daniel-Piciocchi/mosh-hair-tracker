import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

function SnapshotEmptyState() {
  return (
    <div className="card-elevated flex flex-col items-center justify-center px-8 py-16 text-center">
      {/* Icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-mosh-accent">
        <svg className="h-10 w-10 text-mosh-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      {/* Text */}
      <h3 className="mt-6 text-xl font-semibold text-mosh-secondary">
        No snapshots yet
      </h3>
      <p className="mt-2 max-w-sm text-gray-500">
        Start tracking your hair treatment progress by taking your first snapshot.
        You'll need to capture both front and top views.
      </p>

      {/* CTA */}
      <Link to="/new-snapshot" className="mt-8">
        <Button variant="primary" size="lg">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Take Your First Snapshot
        </Button>
      </Link>

      {/* Hint */}
      <p className="mt-6 text-xs text-gray-400">
        Tip: Good lighting helps capture better photos
      </p>
    </div>
  );
}

export { SnapshotEmptyState };
