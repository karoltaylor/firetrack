import cookie from '@fastify/cookie';
import { PrismaClient } from '@prisma/client';
import Fastify, { type FastifyInstance } from 'fastify';

import { authRoutes } from './routes/auth.js';

export const API_VERSION = 'v1';

export interface AppOptions {
  prisma?: PrismaClient;
}

export async function createApp(opts: AppOptions = {}): Promise<FastifyInstance> {
  const prisma: PrismaClient = opts.prisma ?? new PrismaClient();

  const app = Fastify({ logger: process.env['NODE_ENV'] !== 'test' });

  await app.register(cookie);

  app.get('/health', async (_request, reply) => {
    await prisma.$queryRaw`SELECT 1`;
    return reply.send({ db: 'ok' });
  });

  await app.register(authRoutes, { prisma });

  return app;
}
