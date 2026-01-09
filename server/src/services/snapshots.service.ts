import { db } from '@/db/index.js';
import { generateId } from '@/utils/index.js';
import type {
  Snapshot,
  Photo,
  SnapshotRow,
  PhotoRow,
  PhotoType,
} from '@/types/index.js';

function rowToPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    snapshotId: row.snapshot_id,
    type: row.type,
    imageData: row.image_data,
    createdAt: row.created_at,
  };
}

function assembleSnapshot(snapshotRow: SnapshotRow, photos: PhotoRow[]): Snapshot {
  const frontPhotoRow = photos.find((p) => p.type === 'front');
  const topPhotoRow = photos.find((p) => p.type === 'top');

  if (!frontPhotoRow || !topPhotoRow) {
    throw new Error('Snapshot is missing required photos');
  }

  return {
    id: snapshotRow.id,
    notes: snapshotRow.notes ?? '',
    createdAt: snapshotRow.created_at,
    updatedAt: snapshotRow.updated_at,
    frontPhoto: rowToPhoto(frontPhotoRow),
    topPhoto: rowToPhoto(topPhotoRow),
  };
}

export const snapshotsService = {
  getAll(): Snapshot[] {
    const snapshotRows = db
      .prepare('SELECT * FROM snapshots ORDER BY created_at DESC')
      .all() as SnapshotRow[];

    return snapshotRows.map((snapshotRow) => {
      const photoRows = db
        .prepare('SELECT * FROM photos WHERE snapshot_id = ?')
        .all(snapshotRow.id) as PhotoRow[];

      return assembleSnapshot(snapshotRow, photoRows);
    });
  },

  getById(id: string): Snapshot | null {
    const snapshotRow = db
      .prepare('SELECT * FROM snapshots WHERE id = ?')
      .get(id) as SnapshotRow | undefined;

    if (!snapshotRow) {
      return null;
    }

    const photoRows = db
      .prepare('SELECT * FROM photos WHERE snapshot_id = ?')
      .all(id) as PhotoRow[];

    return assembleSnapshot(snapshotRow, photoRows);
  },

  create(frontPhoto: string, topPhoto: string): Snapshot {
    const now = new Date().toISOString();
    const snapshotId = generateId('snap');

    const insertSnapshot = db.prepare(
      'INSERT INTO snapshots (id, notes, created_at, updated_at) VALUES (?, ?, ?, ?)'
    );

    const insertPhoto = db.prepare(
      'INSERT INTO photos (id, snapshot_id, type, image_data, created_at) VALUES (?, ?, ?, ?, ?)'
    );

    const transaction = db.transaction(() => {
      insertSnapshot.run(snapshotId, '', now, now);

      const frontPhotoId = generateId('photo');
      insertPhoto.run(frontPhotoId, snapshotId, 'front', frontPhoto, now);

      const topPhotoId = generateId('photo');
      insertPhoto.run(topPhotoId, snapshotId, 'top', topPhoto, now);
    });

    transaction();

    const created = this.getById(snapshotId);
    if (!created) {
      throw new Error('Failed to create snapshot');
    }

    return created;
  },

  update(
    id: string,
    data: { notes?: string | undefined; frontPhoto?: string | undefined; topPhoto?: string | undefined }
  ): Snapshot | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();

    const updateSnapshotTime = db.prepare(
      'UPDATE snapshots SET updated_at = ? WHERE id = ?'
    );

    const updateSnapshotNotes = db.prepare(
      'UPDATE snapshots SET notes = ?, updated_at = ? WHERE id = ?'
    );

    const updatePhoto = db.prepare(
      'UPDATE photos SET image_data = ?, created_at = ? WHERE snapshot_id = ? AND type = ?'
    );

    const transaction = db.transaction(() => {
      if (data.notes !== undefined) {
        updateSnapshotNotes.run(data.notes, now, id);
      } else {
        updateSnapshotTime.run(now, id);
      }

      if (data.frontPhoto) {
        updatePhoto.run(data.frontPhoto, now, id, 'front');
      }
      if (data.topPhoto) {
        updatePhoto.run(data.topPhoto, now, id, 'top');
      }
    });

    transaction();

    return this.getById(id);
  },

  delete(id: string): boolean {
    const result = db.prepare('DELETE FROM snapshots WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
