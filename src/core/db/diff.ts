import type { StudyData } from '../study/types';
import type { Change } from './protocol';
import { toRow } from './rows';
import { SPECS } from './specs';

function sameRow(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return Object.keys(a).every((key) => a[key] === b[key]);
}

// Compara primeiro por referência: digitar nas Anotações mexe em um item só.
export function diffStudy(before: StudyData, after: StudyData): Change[] {
  const changes: Change[] = [];
  for (const { table, collection } of SPECS) {
    const oldItems = before[collection] as readonly { id: string }[];
    const newItems = after[collection] as readonly { id: string }[];
    if (oldItems === newItems) continue;
    const oldById = new Map(oldItems.map((item) => [item.id, item]));
    const seen = new Set<string>();
    for (const item of newItems) {
      seen.add(item.id);
      const old = oldById.get(item.id);
      if (old === item) continue;
      const row = toRow(table, item);
      if (old && sameRow(toRow(table, old), row)) continue;
      changes.push({ op: 'put', table, row });
    }
    for (const item of oldItems) {
      if (!seen.has(item.id)) changes.push({ op: 'delete', table, id: item.id });
    }
  }
  return changes;
}
