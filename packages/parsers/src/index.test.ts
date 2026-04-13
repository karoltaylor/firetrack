import { describe, it, expect } from 'vitest';
import { generateHeaderFingerprint } from './index.js';

describe('generateHeaderFingerprint', () => {
  it('should return empty string for placeholder implementation', () => {
    const result = generateHeaderFingerprint(['Date', 'Amount', 'Type']);
    expect(result).toBe('');
  });
});
