import { normalize } from './search';
import { dueCards, emptyScope, scopeCards } from './scope';
import type { StudyData } from './types';

// Peça da grade de disciplinas do Treino. Todas as disciplinas entram, de qualquer ano (D179).
export interface SubjectTile {
  id: string;
  code: string;
  name: string;
  color: number;
  due: number;
}

// Duas linhas de cinco, mais quatro: o teto cabe sem rolar (D180).
export const TILE_LIMIT = 14;

// Com cartões vencidos primeiro. Digitar filtra por sigla ou nome, sem acento nem caixa.
export function subjectTiles(data: StudyData, today: string, query: string): SubjectTile[] {
  const term = normalize(query.trim());
  return data.subjects
    .map((subject) => ({
      id: subject.id,
      code: subject.code,
      name: subject.name,
      color: subject.color,
      due: dueCards(scopeCards(data, { ...emptyScope(), subjects: [subject.id] }), today).length,
    }))
    .filter(
      (tile) =>
        term === '' || normalize(tile.code).includes(term) || normalize(tile.name).includes(term),
    )
    .sort((a, b) => b.due - a.due || a.code.localeCompare(b.code));
}

// Passou do teto, o resto fica atrás da digitação. As marcadas nunca somem: ocupam o lugar
// das últimas peças visíveis.
export function capTiles(
  tiles: readonly SubjectTile[],
  keepIds: readonly string[],
  limit: number = TILE_LIMIT,
): { shown: SubjectTile[]; hidden: number } {
  if (tiles.length <= limit) return { shown: [...tiles], hidden: 0 };
  const shown = tiles.slice(0, limit);
  const kept = tiles.slice(limit).filter((tile) => keepIds.includes(tile.id));
  let slot = limit - 1;
  for (const tile of kept) {
    while (slot > 0 && keepIds.includes(shown[slot]?.id ?? '')) slot -= 1;
    shown[slot] = tile;
    slot -= 1;
  }
  return { shown, hidden: tiles.length - limit };
}
