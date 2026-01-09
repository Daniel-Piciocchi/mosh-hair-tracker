import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SnapshotList } from './snapshot-list';
import type { Snapshot } from '@/types';

const TEST_IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

function createMockSnapshot(id: string, date: string): Snapshot {
  return {
    id,
    notes: '',
    createdAt: date,
    updatedAt: date,
    frontPhoto: {
      id: `photo_front_${id}`,
      snapshotId: id,
      type: 'front',
      imageData: TEST_IMAGE,
      createdAt: date,
    },
    topPhoto: {
      id: `photo_top_${id}`,
      snapshotId: id,
      type: 'top',
      imageData: TEST_IMAGE,
      createdAt: date,
    },
  };
}

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('SnapshotList', () => {
  it('renders empty state when no snapshots', () => {
    renderWithRouter(<SnapshotList snapshots={[]} onDelete={vi.fn()} onSnapshotClick={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByText(/no snapshots yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /take your first snapshot/i })).toBeInTheDocument();
  });

  it('renders snapshot cards when snapshots exist', () => {
    const snapshots = [
      createMockSnapshot('snap_1', '2026-01-09T10:00:00Z'),
      createMockSnapshot('snap_2', '2026-01-08T10:00:00Z'),
    ];

    renderWithRouter(<SnapshotList snapshots={snapshots} onDelete={vi.fn()} onSnapshotClick={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.queryByText(/no snapshots yet/i)).not.toBeInTheDocument();
    expect(screen.getAllByAltText('Front view')).toHaveLength(2);
    expect(screen.getAllByAltText('Top view')).toHaveLength(2);
  });

  it('renders correct number of delete buttons', () => {
    const snapshots = [
      createMockSnapshot('snap_1', '2026-01-09T10:00:00Z'),
      createMockSnapshot('snap_2', '2026-01-08T10:00:00Z'),
      createMockSnapshot('snap_3', '2026-01-07T10:00:00Z'),
    ];

    renderWithRouter(<SnapshotList snapshots={snapshots} onDelete={vi.fn()} onSnapshotClick={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(3);
  });
});
