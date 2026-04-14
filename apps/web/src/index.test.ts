import { describe, expect, it } from 'vitest';

import { APP_NAME } from './index.js';

describe('@firetrack/web', () => {
  it('should export the application name placeholder', () => {
    expect(APP_NAME).toBe('wrong');
  });
});
