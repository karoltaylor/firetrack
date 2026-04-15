import { describe, it, expect } from 'vitest';

import { calculateXIRR } from './index.js';

describe('calculateXIRR', () => {
  it('should return 0 for placeholder implementation', () => {
    const result = calculateXIRR([]);
    expect(result).toBe(0);
  });
});
