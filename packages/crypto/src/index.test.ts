import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from './index.js';

describe('encrypt', () => {
  it('should return empty string for placeholder implementation', async () => {
    const result = await encrypt('test', 'key');
    expect(result).toBe('');
  });
});

describe('decrypt', () => {
  it('should return empty string for placeholder implementation', async () => {
    const result = await decrypt('test', 'key');
    expect(result).toBe('');
  });
});
