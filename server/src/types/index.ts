export type PhotoType = 'front' | 'top';

export interface Photo {
  id: string;
  snapshotId: string;
  type: PhotoType;
  imageData: string;
  createdAt: string;
}

export interface Snapshot {
  id: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  frontPhoto: Photo;
  topPhoto: Photo;
}

// Database row types
export interface SnapshotRow {
  id: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PhotoRow {
  id: string;
  snapshot_id: string;
  type: PhotoType;
  image_data: string;
  created_at: string;
}

// API contracts
export interface CreateSnapshotRequest {
  frontPhoto: string;
  topPhoto: string;
}

export interface UpdateSnapshotRequest {
  notes?: string | undefined;
  frontPhoto?: string | undefined;
  topPhoto?: string | undefined;
}

export interface SnapshotListResponse {
  snapshots: Snapshot[];
  total: number;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string | undefined;
}

export interface ApiError {
  error: string;
  message: string;
}
