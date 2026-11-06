import { KEYS, type KeyGroup, type KeyRow } from './keys';

export interface HelpSection {
  group: KeyGroup;
  rows: readonly KeyRow[];
}

export function helpSections(keys: readonly KeyRow[] = KEYS): HelpSection[] {
  const groups = [...new Set(keys.map((key) => key.group))];
  return groups.map((group) => ({ group, rows: keys.filter((key) => key.group === group) }));
}

// Lista as combinações repetidas: code + modificadores + nível só pode aparecer uma vez.
export function findConflicts(keys: readonly KeyRow[] = KEYS): string[] {
  const seen = new Set<string>();
  const conflicts: string[] = [];
  for (const key of keys) {
    for (const level of key.levels) {
      const id = `${key.mods}:${key.code}:${level}`;
      if (seen.has(id)) conflicts.push(id);
      seen.add(id);
    }
  }
  return conflicts;
}
