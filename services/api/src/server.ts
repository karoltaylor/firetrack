import { PrismaClient } from '@prisma/client';

import { createApp } from './index.js';

const prisma = new PrismaClient();
const app = createApp(prisma);

const PORT = process.env['PORT'] ?? '3001';

app.listen({ port: Number(PORT), host: '0.0.0.0' }, (err) => {
  if (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(1);
  }
});
