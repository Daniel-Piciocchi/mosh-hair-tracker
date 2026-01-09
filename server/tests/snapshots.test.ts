import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

// A minimal valid base64 JPEG image for testing
const TEST_IMAGE =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k=';

describe('GET /api/snapshots', () => {
  it('returns empty array when no snapshots exist', async () => {
    const res = await request(app).get('/api/snapshots');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      data: {
        snapshots: [],
        total: 0,
      },
    });
  });
});

describe('POST /api/snapshots', () => {
  it('creates snapshot with valid data', async () => {
    const res = await request(app)
      .post('/api/snapshots')
      .send({ frontPhoto: TEST_IMAGE, topPhoto: TEST_IMAGE });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      id: expect.stringMatching(/^snap_/),
      frontPhoto: expect.objectContaining({ type: 'front' }),
      topPhoto: expect.objectContaining({ type: 'top' }),
    });
  });

  it('returns 400 for invalid data', async () => {
    const res = await request(app)
      .post('/api/snapshots')
      .send({ frontPhoto: 'not-base64' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation Error');
  });

  it('returns 400 when missing required fields', async () => {
    const res = await request(app).post('/api/snapshots').send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation Error');
  });
});

describe('GET /api/snapshots/:id', () => {
  it('returns 404 for non-existent snapshot', async () => {
    const res = await request(app).get('/api/snapshots/snap_nonexistent');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });

  it('returns snapshot by id', async () => {
    // Create a snapshot first
    const createRes = await request(app)
      .post('/api/snapshots')
      .send({ frontPhoto: TEST_IMAGE, topPhoto: TEST_IMAGE });

    const snapshotId = createRes.body.data.id as string;

    const res = await request(app).get(`/api/snapshots/${snapshotId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(snapshotId);
  });
});

describe('DELETE /api/snapshots/:id', () => {
  it('returns 404 for non-existent snapshot', async () => {
    const res = await request(app).delete('/api/snapshots/snap_nonexistent');

    expect(res.status).toBe(404);
  });

  it('deletes existing snapshot', async () => {
    // Create a snapshot first
    const createRes = await request(app)
      .post('/api/snapshots')
      .send({ frontPhoto: TEST_IMAGE, topPhoto: TEST_IMAGE });

    const snapshotId = createRes.body.data.id as string;

    const deleteRes = await request(app).delete(`/api/snapshots/${snapshotId}`);
    expect(deleteRes.status).toBe(204);

    // Verify it's deleted
    const getRes = await request(app).get(`/api/snapshots/${snapshotId}`);
    expect(getRes.status).toBe(404);
  });
});
