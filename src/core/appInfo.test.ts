import { describe, expect, it } from 'vitest';
import { prefixed, STORAGE_PREFIX } from './appInfo';

describe('prefixed', () => {
  it('nunca colide com as chaves do app antigo', () => {
    expect(prefixed('db')).toBe(`${STORAGE_PREFIX}db`);
    expect(prefixed('db').startsWith('ohara-')).toBe(false);
    expect(prefixed('db').startsWith('ohara.')).toBe(false);
  });
});
