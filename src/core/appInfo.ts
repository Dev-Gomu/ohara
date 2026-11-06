// Prefixo único do app novo. O legado usa chaves "ohara-" e "ohara." no mesmo domínio,
// então tudo que ficar no navegador (banco, localStorage, caches) começa com este prefixo.
export const STORAGE_PREFIX = 'ohara2-';

export function prefixed(name: string): string {
  return `${STORAGE_PREFIX}${name}`;
}
