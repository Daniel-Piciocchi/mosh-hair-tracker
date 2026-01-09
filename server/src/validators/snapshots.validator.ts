import { z } from 'zod';

const base64ImageSchema = z
  .string()
  .regex(
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/,
    'Invalid base64 image format'
  );

export const createSnapshotSchema = z.object({
  frontPhoto: base64ImageSchema,
  topPhoto: base64ImageSchema,
});

export const updateSnapshotSchema = z
  .object({
    notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
    frontPhoto: base64ImageSchema.optional(),
    topPhoto: base64ImageSchema.optional(),
  })
  .refine(
    (data) => data.notes !== undefined || data.frontPhoto !== undefined || data.topPhoto !== undefined,
    { message: 'At least one field required' }
  );

// Infer types from schemas
export type CreateSnapshotInput = z.infer<typeof createSnapshotSchema>;
export type UpdateSnapshotInput = z.infer<typeof updateSnapshotSchema>;
