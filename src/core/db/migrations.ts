export interface Migration {
  version: number;
  sql: string;
}

// O SQL chega já como texto: o core não importa arquivo.
export function pending(all: readonly Migration[], current: number): Migration[] {
  return all.filter((item) => item.version > current).sort((a, b) => a.version - b.version);
}

export function latestVersion(all: readonly Migration[]): number {
  return all.reduce((best, item) => Math.max(best, item.version), 0);
}
