import { beforeAll, describe, expect, it } from 'vitest';

import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
} from './auth.service.js';

beforeAll(() => {
  process.env['JWT_SECRET'] = 'test-jwt-secret-min-32-chars-long-ok';
  process.env['JWT_REFRESH_SECRET'] = 'test-jwt-refresh-secret-min-32-chars-long-ok';
});

describe('hashPassword', () => {
  it('returns an Argon2id hash string', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it('produces different hashes for the same password (random salt)', async () => {
    const h1 = await hashPassword('same-password-123');
    const h2 = await hashPassword('same-password-123');
    expect(h1).not.toBe(h2);
  });
});

describe('verifyPassword', () => {
  it('returns true for correct password', async () => {
    const hash = await hashPassword('correct-password-123');
    expect(await verifyPassword('correct-password-123', hash)).toBe(true);
  });

  it('returns false for wrong password', async () => {
    const hash = await hashPassword('correct-password-123');
    expect(await verifyPassword('wrong-password-456', hash)).toBe(false);
  });
});

describe('generateAccessToken', () => {
  it('returns a JWT string with 3 dot-separated parts', async () => {
    const token = await generateAccessToken('user-id-123');
    expect(token.split('.')).toHaveLength(3);
  });
});

describe('generateRefreshToken', () => {
  it('returns a JWT string with 3 dot-separated parts', async () => {
    const token = await generateRefreshToken('user-id-123');
    expect(token.split('.')).toHaveLength(3);
  });
});
