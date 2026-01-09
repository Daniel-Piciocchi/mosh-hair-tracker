import express from 'express';
import cors from 'cors';
import { snapshotsRouter } from '@/routes/index.js';
import { errorHandler, notFound } from '@/middleware/index.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/snapshots', snapshotsRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
