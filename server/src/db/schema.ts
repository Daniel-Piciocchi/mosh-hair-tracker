import { db } from './connection.js';

export function initializeSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id TEXT PRIMARY KEY,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      snapshot_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('front', 'top')),
      image_data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (snapshot_id) REFERENCES snapshots(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_photos_snapshot_id ON photos(snapshot_id);
    CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON snapshots(created_at DESC);
  `);
}
