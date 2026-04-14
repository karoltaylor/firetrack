import type { PrismaClient } from '@prisma/client';
import Fastify, { type FastifyInstance } from 'fastify';

import { healthRoutes } from './routes/health.js';

export const API_VERSION = 'v1';

export function createApp(prisma: PrismaClient): FastifyInstance {
  const app = Fastify({ logger: false });

  app.register(healthRoutes, { prisma });

  return app;
}
