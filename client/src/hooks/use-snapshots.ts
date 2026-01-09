import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services';
import type { Snapshot, CreateSnapshotRequest, UpdateSnapshotRequest } from '@/types';

export interface UseSnapshotsReturn {
  snapshots: Snapshot[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createSnapshot: (data: CreateSnapshotRequest) => Promise<Snapshot>;
  updateSnapshot: (id: string, data: UpdateSnapshotRequest) => Promise<Snapshot>;
  deleteSnapshot: (id: string) => Promise<void>;
}

export function useSnapshots(): UseSnapshotsReturn {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getSnapshots();
      setSnapshots(response.snapshots);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSnapshot = useCallback(
    async (data: CreateSnapshotRequest): Promise<Snapshot> => {
      const newSnapshot = await api.createSnapshot(data);
      setSnapshots((prev) => [newSnapshot, ...prev]);
      return newSnapshot;
    },
    []
  );

  const updateSnapshot = useCallback(
    async (id: string, data: UpdateSnapshotRequest): Promise<Snapshot> => {
      const updatedSnapshot = await api.updateSnapshot(id, data);
      setSnapshots((prev) =>
        prev.map((s) => (s.id === id ? updatedSnapshot : s))
      );
      return updatedSnapshot;
    },
    []
  );

  const deleteSnapshot = useCallback(async (id: string): Promise<void> => {
    await api.deleteSnapshot(id);
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    snapshots,
    isLoading,
    error,
    refresh,
    createSnapshot,
    updateSnapshot,
    deleteSnapshot,
  };
}
