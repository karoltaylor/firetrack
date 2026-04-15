import type { PrismaClient } from '@prisma/client';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

interface HealthPluginOptions extends FastifyPluginOptions {
  prisma: PrismaClient;
}

export async function healthRoutes(
  app: FastifyInstance,
  options: HealthPluginOptions,
): Promise<void> {
  app.get('/health', async () => {
    await options.prisma.$queryRaw`SELECT 1`;
    return { db: 'ok' };
  });
}
