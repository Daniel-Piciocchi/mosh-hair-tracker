import { Router } from 'express';
import { snapshotsController } from '@/controllers/index.js';

const router = Router();

router.get('/', snapshotsController.getAll);
router.get('/:id', snapshotsController.getById);
router.post('/', snapshotsController.create);
router.put('/:id', snapshotsController.update);
router.delete('/:id', snapshotsController.delete);

export { router as snapshotsRouter };
