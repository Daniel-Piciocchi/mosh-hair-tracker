import type {
  Snapshot,
  SnapshotListResponse,
  CreateSnapshotRequest,
  UpdateSnapshotRequest,
  ApiResponse,
} from '@/types';

const API_BASE = import.meta.env['VITE_API_URL'] || '/api';

export const api = {
  async getSnapshots(): Promise<SnapshotListResponse> {
    const response = await fetch(`${API_BASE}/snapshots`);
    if (!response.ok) {
      throw new Error('Failed to fetch snapshots');
    }
    const result = (await response.json()) as ApiResponse<SnapshotListResponse>;
    return result.data;
  },

  async createSnapshot(data: CreateSnapshotRequest): Promise<Snapshot> {
    const response = await fetch(`${API_BASE}/snapshots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create snapshot');
    }
    const result = (await response.json()) as ApiResponse<Snapshot>;
    return result.data;
  },

  async updateSnapshot(id: string, data: UpdateSnapshotRequest): Promise<Snapshot> {
    const response = await fetch(`${API_BASE}/snapshots/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update snapshot');
    }
    const result = (await response.json()) as ApiResponse<Snapshot>;
    return result.data;
  },

  async deleteSnapshot(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/snapshots/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete snapshot');
    }
  },
};
