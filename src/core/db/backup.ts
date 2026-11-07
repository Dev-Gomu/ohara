const HEADER = 'SQLite format 3\u0000';

export function looksLikeSqlite(bytes: Uint8Array): boolean {
  if (bytes.length < HEADER.length) return false;
  return [...HEADER].every((char, index) => bytes[index] === char.charCodeAt(0));
}

// Só aceita backup do próprio Ohara e de uma versão que este app sabe abrir.
export type ImportCheck = 'ok' | 'nao-sqlite' | 'nao-ohara' | 'versao-nova';

export function checkImport(
  tables: readonly string[],
  schema: number,
  latest: number,
): ImportCheck {
  if (!tables.includes('lessons') || !tables.includes('meta')) return 'nao-ohara';
  return schema > latest || schema < 1 ? 'versao-nova' : 'ok';
}
