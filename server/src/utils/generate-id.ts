import { randomBytes } from 'node:crypto';

export function generateId(prefix: string): string {
  const randomPart = randomBytes(12).toString('hex');
  return `${prefix}_${randomPart}`;
}
