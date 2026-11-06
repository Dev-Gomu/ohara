import { expect, it } from 'vitest';
import { DB_NAME } from './dbName';

it('o banco usa o prefixo próprio', () => {
  expect(DB_NAME).toBe('ohara2-db');
});
