import { beforeEach } from 'vitest';
import { db } from '../src/db/connection.js';
import { initializeSchema } from '../src/db/schema.js';

// Initialize schema before tests
initializeSchema();

// Clean up database before each test
beforeEach(() => {
  db.exec('DELETE FROM photos; DELETE FROM snapshots;');
});
