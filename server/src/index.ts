import { app } from '@/app.js';
import { initializeSchema } from '@/db/index.js';

initializeSchema();

const PORT = process.env['PORT'] ?? 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
