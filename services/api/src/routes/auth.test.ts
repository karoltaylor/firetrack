import type { PrismaClient } from '@prisma/client';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { createApp } from '../index.js';

beforeAll(() => {
  process.env['JWT_SECRET'] = 'test-jwt-secret-min-32-chars-long-ok';
  process.env['JWT_REFRESH_SECRET'] = 'test-jwt-refresh-secret-min-32-chars-long-ok';
});

const mockPrismaBase = {
  $queryRaw: vi.fn().mockResolvedValue([]),
  user: {
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: 'user-uuid-123', email: 'test@example.com' }),
  },
};

function makeMockPrisma(overrides: Partial<typeof mockPrismaBase> = {}) {
  return { ...mockPrismaBase, ...overrides } as unknown as PrismaClient;
}

describe('POST /auth/register', () => {
  it('returns 201 with accessToken on valid registration', async () => {
    const app = await createApp({ prisma: makeMockPrisma() });
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'test@example.com', password: 'ValidPassword123!' },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json() as { accessToken: string };
    expect(body).toHaveProperty('accessToken');
    expect(typeof body.accessToken).toBe('string');
  });

  it('sets HttpOnly refresh_token cookie on success', async () => {
    const app = await createApp({ prisma: makeMockPrisma() });
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'test@example.com', password: 'ValidPassword123!' },
    });

    const cookies = res.cookies;
    const refreshCookie = cookies.find((c) => c.name === 'refresh_token');
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie?.httpOnly).toBe(true);
  });

  it('returns 400 when password is shorter than 12 chars', async () => {
    const app = await createApp({ prisma: makeMockPrisma() });
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'test@example.com', password: 'short' },
    });

    expect(res.statusCode).toBe(400);
    expect((res.json() as { error: string }).error).toMatch(/12 characters/i);
  });

  it('returns 400 for invalid email format', async () => {
    const app = await createApp({ prisma: makeMockPrisma() });
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'not-an-email', password: 'ValidPassword123!' },
    });

    expect(res.statusCode).toBe(400);
  });

  it('returns 409 when email already exists', async () => {
    const prisma = makeMockPrisma({
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'existing', email: 'taken@example.com' }),
        create: vi.fn(),
      },
    });
    const app = await createApp({ prisma });
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'taken@example.com', password: 'ValidPassword123!' },
    });

    expect(res.statusCode).toBe(409);
    expect((res.json() as { error: string }).error).toMatch(/already registered/i);
  });
});
