import type { Request, Response, NextFunction } from 'express';
import { snapshotsService } from '@/services/index.js';
import { createSnapshotSchema, updateSnapshotSchema } from '@/validators/index.js';

export const snapshotsController = {
  async getAll(_req: Request, res: Response, _next: NextFunction) {
    const snapshots = snapshotsService.getAll();
    res.json({
      data: {
        snapshots,
        total: snapshots.length,
      },
    });
  },

  async getById(req: Request, res: Response, _next: NextFunction) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Bad Request', message: 'ID is required' });
      return;
    }

    const snapshot = snapshotsService.getById(id);
    if (!snapshot) {
      res.status(404).json({ error: 'Not Found', message: 'Snapshot not found' });
      return;
    }

    res.json({ data: snapshot });
  },

  async create(req: Request, res: Response, _next: NextFunction) {
    const result = createSnapshotSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: result.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const snapshot = snapshotsService.create(
      result.data.frontPhoto,
      result.data.topPhoto
    );
    res.status(201).json({ data: snapshot });
  },

  async update(req: Request, res: Response, _next: NextFunction) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Bad Request', message: 'ID is required' });
      return;
    }

    const result = updateSnapshotSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: result.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const snapshot = snapshotsService.update(id, result.data);
    if (!snapshot) {
      res.status(404).json({ error: 'Not Found', message: 'Snapshot not found' });
      return;
    }

    res.json({ data: snapshot });
  },

  async delete(req: Request, res: Response, _next: NextFunction) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Bad Request', message: 'ID is required' });
      return;
    }

    const deleted = snapshotsService.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: 'Snapshot not found' });
      return;
    }

    res.status(204).send();
  },
};
