import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnapshotCard } from './snapshot-card';
import type { Snapshot } from '@/types';

const TEST_IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

const mockSnapshot: Snapshot = {
  id: 'snap_123',
  notes: '',
  createdAt: '2026-01-09T10:30:00Z',
  updatedAt: '2026-01-09T10:30:00Z',
  frontPhoto: {
    id: 'photo_front_123',
    snapshotId: 'snap_123',
    type: 'front',
    imageData: TEST_IMAGE,
    createdAt: '2026-01-09T10:30:00Z',
  },
  topPhoto: {
    id: 'photo_top_123',
    snapshotId: 'snap_123',
    type: 'top',
    imageData: TEST_IMAGE,
    createdAt: '2026-01-09T10:30:00Z',
  },
};

describe('SnapshotCard', () => {
  it('renders snapshot with both photos', () => {
    render(<SnapshotCard snapshot={mockSnapshot} onDelete={vi.fn()} onClick={vi.fn()} />);

    expect(screen.getByAltText('Front view')).toBeInTheDocument();
    expect(screen.getByAltText('Top view')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<SnapshotCard snapshot={mockSnapshot} onDelete={vi.fn()} onClick={vi.fn()} />);

    expect(screen.getByText('9 Jan 2026')).toBeInTheDocument();
  });

  it('shows delete button initially', () => {
    render(<SnapshotCard snapshot={mockSnapshot} onDelete={vi.fn()} onClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
  });

  it('shows confirmation buttons after clicking delete', async () => {
    const user = userEvent.setup();
    render(<SnapshotCard snapshot={mockSnapshot} onDelete={vi.fn()} onClick={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('hides confirmation when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<SnapshotCard snapshot={mockSnapshot} onDelete={vi.fn()} onClick={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
  });

  it('calls onDelete with snapshot id when confirmed', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(<SnapshotCard snapshot={mockSnapshot} onDelete={onDelete} onClick={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(onDelete).toHaveBeenCalledWith('snap_123');
  });

  it('disables buttons while deleting', async () => {
    const user = userEvent.setup();
    let resolveDelete: () => void;
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });
    const onDelete = vi.fn().mockReturnValue(deletePromise);

    render(<SnapshotCard snapshot={mockSnapshot} onDelete={onDelete} onClick={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();

    // Resolve the promise and wait for state to settle
    await act(async () => {
      resolveDelete!();
    });
  });

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<SnapshotCard snapshot={mockSnapshot} onDelete={vi.fn()} onClick={onClick} />);

    await user.click(screen.getByAltText('Front view'));

    expect(onClick).toHaveBeenCalledWith(mockSnapshot);
  });
});
