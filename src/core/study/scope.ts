import { foldersOf, lessonsOf } from './queries';
import type { Card, Lesson, StudyData, Subject } from './types';

// O que entra no treino. Sem matéria, as linhas são os bimestres de todas as matérias,
// juntados pelo nome. Com matéria, são as pastas dela e, abaixo de cada uma, as aulas.
export const EVERYTHING = 'tudo';
export const LOOSE = 'sem';
const BY_NAME = 'nome:';

export interface ScopeRow {
  id: string;
  kind: 'all' | 'folder' | 'lesson';
  label: string;
  checked: boolean;
  due: number;
  total: number;
}

export interface Scope {
  subjectId: string | null;
  picks: readonly string[];
}

export const fullScope = (subjectId: string | null): Scope => ({ subjectId, picks: [EVERYTHING] });

export function activeSubjects(data: StudyData): Subject[] {
  const archived = new Set(data.years.filter((year) => year.archived).map((year) => year.id));
  return data.subjects.filter((subject) => !archived.has(subject.yearId));
}

const nameKey = (name: string): string => BY_NAME + name.trim().toLowerCase();

function lessonsInScope(data: StudyData, subjectId: string | null): Lesson[] {
  if (subjectId !== null) return lessonsOf(data, subjectId);
  const subjects = new Set(activeSubjects(data).map((subject) => subject.id));
  return data.lessons.filter((lesson) => subjects.has(lesson.subjectId));
}

// Chave do grupo da aula: com matéria é a pasta; sem matéria, o nome da pasta.
function groupOf(data: StudyData, lesson: Lesson, bySubject: boolean): string {
  if (lesson.folderId === null) return LOOSE;
  if (bySubject) return lesson.folderId;
  const folder = data.folders.find((item) => item.id === lesson.folderId);
  return folder ? nameKey(folder.name) : LOOSE;
}

function picked(data: StudyData, scope: Scope, lesson: Lesson): boolean {
  const { picks } = scope;
  if (picks.includes(lesson.id)) return true;
  return picks.includes(groupOf(data, lesson, scope.subjectId !== null));
}

const covers = (data: StudyData, scope: Scope, lesson: Lesson): boolean =>
  scope.picks.includes(EVERYTHING) || picked(data, scope, lesson);

export function scopeLessons(data: StudyData, scope: Scope): Lesson[] {
  return lessonsInScope(data, scope.subjectId).filter((lesson) => covers(data, scope, lesson));
}

export function scopeCards(data: StudyData, scope: Scope): Card[] {
  const lessons = new Set(scopeLessons(data, scope).map((lesson) => lesson.id));
  return data.cards.filter((card) => lessons.has(card.lessonId));
}

export const dueCards = (cards: readonly Card[], today: string): Card[] =>
  cards.filter((card) => card.due <= today);

function counts(data: StudyData, lessons: readonly Lesson[], today: string) {
  const ids = new Set(lessons.map((lesson) => lesson.id));
  const cards = data.cards.filter((card) => ids.has(card.lessonId));
  return { total: cards.length, due: dueCards(cards, today).length };
}

interface Group {
  id: string;
  label: string;
  lessons: Lesson[];
}

function groups(data: StudyData, scope: Scope): Group[] {
  const lessons = lessonsInScope(data, scope.subjectId);
  const bySubject = scope.subjectId !== null;
  const named = bySubject
    ? foldersOf(data, scope.subjectId ?? '').map((folder) => ({
        id: folder.id,
        label: folder.name,
      }))
    : uniqueFolderNames(data);
  const result = named.map((group) => ({
    ...group,
    lessons: lessons.filter((lesson) => groupOf(data, lesson, bySubject) === group.id),
  }));
  const loose = lessons.filter((lesson) => lesson.folderId === null);
  if (loose.length > 0) result.push({ id: LOOSE, label: 'Sem bimestre', lessons: loose });
  return result.filter((group) => group.lessons.length > 0);
}

function uniqueFolderNames(data: StudyData): { id: string; label: string }[] {
  const subjects = new Set(activeSubjects(data).map((subject) => subject.id));
  const folders = data.folders
    .filter((folder) => subjects.has(folder.subjectId))
    .sort((a, b) => a.order - b.order);
  const seen = new Map<string, string>();
  for (const folder of folders) {
    const key = nameKey(folder.name);
    if (!seen.has(key)) seen.set(key, folder.name);
  }
  return [...seen].map(([id, label]) => ({ id, label }));
}

// Bimestres (pastas) que a régua de período oferece, na ordem da matéria.
export function scopePeriods(data: StudyData, subjectId: string | null): { id: string; label: string }[] {
  return groups(data, fullScope(subjectId)).map(({ id, label }) => ({ id, label }));
}

export function scopeRows(data: StudyData, scope: Scope, today: string): ScopeRow[] {
  const all = lessonsInScope(data, scope.subjectId);
  const rows: ScopeRow[] = [
    {
      id: EVERYTHING,
      kind: 'all',
      label: scope.subjectId === null ? 'Todos os cartões' : 'Matéria inteira',
      checked: scope.picks.includes(EVERYTHING),
      ...counts(data, all, today),
    },
  ];
  for (const group of groups(data, scope)) {
    rows.push({
      id: group.id,
      kind: 'folder',
      label: group.label,
      checked: scope.picks.includes(group.id),
      ...counts(data, group.lessons, today),
    });
    if (scope.subjectId === null) continue;
    for (const lesson of [...group.lessons].sort((a, b) => a.date.localeCompare(b.date))) {
      rows.push({
        id: lesson.id,
        kind: 'lesson',
        label: lesson.title,
        checked: picked(data, scope, lesson),
        ...counts(data, [lesson], today),
      });
    }
  }
  return rows;
}

// Com "tudo" ativo, marcar uma linha é escolher só ela, o caso mais comum. Desmarcar a
// última volta a "tudo", para a escolha nunca ficar vazia. Desmarcar uma aula de pasta
// marcada troca a pasta pelas outras aulas dela.
export function togglePick(data: StudyData, scope: Scope, rowId: string): Scope {
  if (rowId === EVERYTHING || scope.picks.includes(EVERYTHING)) {
    return rowId === EVERYTHING ? fullScope(scope.subjectId) : { ...scope, picks: [rowId] };
  }
  const { picks } = scope;
  const bySubject = scope.subjectId !== null;
  const lessons = lessonsInScope(data, scope.subjectId);
  const lesson = lessons.find((item) => item.id === rowId);
  let next: string[];
  if (lesson && picks.includes(groupOf(data, lesson, bySubject))) {
    const group = groupOf(data, lesson, bySubject);
    const others = lessons
      .filter((item) => item.id !== lesson.id && groupOf(data, item, bySubject) === group)
      .map((item) => item.id);
    next = [...picks.filter((pick) => pick !== group), ...others];
  } else if (picks.includes(rowId)) {
    next = picks.filter((pick) => pick !== rowId);
  } else if (lesson) {
    next = [...picks, rowId];
  } else {
    const inside = new Set(
      lessons.filter((item) => groupOf(data, item, bySubject) === rowId).map((item) => item.id),
    );
    next = [...picks.filter((pick) => !inside.has(pick)), rowId];
  }
  return next.length === 0 ? fullScope(scope.subjectId) : { ...scope, picks: next };
}

// Frase curta do resumo: "Imunologia · 2º bimestre e 1 aula".
export function describeScope(data: StudyData, scope: Scope): string {
  const subject = data.subjects.find((item) => item.id === scope.subjectId);
  const where = subject?.name ?? 'Todas as matérias';
  if (scope.picks.includes(EVERYTHING)) return where;
  const rows = groups(data, scope);
  const folders = rows.filter((row) => scope.picks.includes(row.id)).map((row) => row.label);
  const lessons = scope.picks.filter((pick) => !rows.some((row) => row.id === pick)).length;
  const parts = [...folders];
  if (lessons > 0) parts.push(lessons === 1 ? '1 aula' : `${lessons} aulas`);
  const last = parts.pop() ?? '';
  return `${where} · ${parts.length > 0 ? `${parts.join(', ')} e ${last}` : last}`;
}
