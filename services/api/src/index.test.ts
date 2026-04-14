import type { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { API_VERSION, createApp } from './index.js';

const mockPrisma = {
  $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
} as unknown as PrismaClient;

describe('API module', () => {
  it('should export API version', () => {
    expect(API_VERSION).toBe('v1');
  });
});

describe('GET /health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$queryRaw = vi.fn().mockResolvedValue([{ '?column?': 1 }]);
  });

  it('returns 200 with { db: "ok" } when database is reachable', async () => {
    const app = await createApp({ prisma: mockPrisma });
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ db: 'ok' });
  });

  it('returns 500 when database is unreachable', async () => {
    mockPrisma.$queryRaw = vi.fn().mockRejectedValue(new Error('DB down'));
    const app = await createApp({ prisma: mockPrisma });
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(500);
  });
});
