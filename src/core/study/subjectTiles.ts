import { normalize } from './search';
import { activeSubjects, dueCards, fullScope, scopeCards } from './scope';
import type { StudyData } from './types';

// Peça da grade de disciplinas do Treino. id nulo é "Todas".
export interface SubjectTile {
  id: string | null;
  code: string;
  name: string;
  color: number | null;
  due: number;
}

// Duas linhas de sete, contando "Todas".
export const TILE_LIMIT = 14;

// Com cartões vencidos primeiro. Digitar filtra por sigla ou nome, sem acento nem caixa, e
// tira "Todas": quem digita quer uma disciplina.
export function subjectTiles(data: StudyData, today: string, query: string): SubjectTile[] {
  const term = normalize(query.trim());
  const subjects = activeSubjects(data)
    .map((subject) => ({
      id: subject.id,
      code: subject.code,
      name: subject.name,
      color: subject.color,
      due: dueCards(scopeCards(data, fullScope(subject.id)), today).length,
    }))
    .filter(
      (tile) => term === '' || normalize(tile.code).includes(term) || normalize(tile.name).includes(term),
    )
    .sort((a, b) => b.due - a.due || a.code.localeCompare(b.code));
  if (term !== '') return subjects;
  const everything = dueCards(scopeCards(data, fullScope(null)), today).length;
  return [{ id: null, code: 'Todas', name: 'Todas as matérias', color: null, due: everything }, ...subjects];
}

// Passou do teto, o resto fica atrás da digitação. A escolhida nunca some: ela troca de
// lugar com a última peça visível.
export function capTiles(
  tiles: readonly SubjectTile[],
  keepId: string | null,
  limit: number = TILE_LIMIT,
): { shown: SubjectTile[]; hidden: number } {
  if (tiles.length <= limit) return { shown: [...tiles], hidden: 0 };
  const shown = tiles.slice(0, limit);
  const kept = keepId === null ? undefined : tiles.slice(limit).find((tile) => tile.id === keepId);
  if (kept) shown[limit - 1] = kept;
  return { shown, hidden: tiles.length - limit };
}
