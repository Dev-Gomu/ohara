import { describe, expect, it } from 'vitest';
import { checkImport, looksLikeSqlite } from './backup';

describe('importar banco', () => {
  it('reconhece o cabeçalho do SQLite', () => {
    const ok = new TextEncoder().encode('SQLite format 3\u0000resto');
    expect(looksLikeSqlite(ok)).toBe(true);
    expect(looksLikeSqlite(new TextEncoder().encode('%PDF-1.4 qualquer coisa'))).toBe(false);
    expect(looksLikeSqlite(new Uint8Array(3))).toBe(false);
  });

  it('só aceita banco do Ohara e de versão conhecida', () => {
    expect(checkImport(['lessons', 'meta'], 2, 2)).toBe('ok');
    expect(checkImport(['lessons', 'meta'], 1, 2)).toBe('ok');
    expect(checkImport(['lessons', 'meta'], 3, 2)).toBe('versao-nova');
    expect(checkImport(['outra'], 2, 2)).toBe('nao-ohara');
  });
});
