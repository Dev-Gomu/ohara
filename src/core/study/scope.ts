import { dayOf } from './schedule';
import type { Card, Lesson, StudyData } from './types';

// O que entra no treino (D179, D180). Quatro categorias, todas aceitam vários valores.
// Categoria vazia vale "todos"; dentro da categoria é "ou", entre categorias é "e".
// Todos os anos entram, inclusive os arquivados.
export interface Scope {
  years: readonly string[];
  // Bimestre é a pasta pelo nome (periodKey), porque cada matéria tem a sua pasta.
  periods: readonly string[];
  subjects: readonly string[];
  lessons: readonly string[];
}

export const emptyScope = (): Scope => ({ years: [], periods: [], subjects: [], lessons: [] });

export const isEmptyScope = (scope: Scope): boolean =>
  scope.years.length + scope.periods.length + scope.subjects.length + scope.lessons.length === 0;

export const periodKey = (name: string): string => name.trim().toLowerCase();

const LOOSE_LABEL = 'Sem bimestre';
const LOOSE_KEY = periodKey(LOOSE_LABEL);

function folderKey(data: StudyData, lesson: Lesson): string {
  if (lesson.folderId === null) return LOOSE_KEY;
  const folder = data.folders.find((item) => item.id === lesson.folderId);
  return folder ? periodKey(folder.name) : LOOSE_KEY;
}

const yearOf = (data: StudyData, lesson: Lesson): string | undefined =>
  data.subjects.find((subject) => subject.id === lesson.subjectId)?.yearId;

const allows = (list: readonly string[], value: string | undefined): boolean =>
  list.length === 0 || (value !== undefined && list.includes(value));

export function scopeLessons(data: StudyData, scope: Scope): Lesson[] {
  return data.lessons.filter(
    (lesson) =>
      allows(scope.years, yearOf(data, lesson)) &&
      allows(scope.periods, folderKey(data, lesson)) &&
      allows(scope.subjects, lesson.subjectId) &&
      allows(scope.lessons, lesson.id),
  );
}

export function scopeCards(data: StudyData, scope: Scope): Card[] {
  const lessons = new Set(scopeLessons(data, scope).map((lesson) => lesson.id));
  return data.cards.filter((card) => lessons.has(card.lessonId));
}

export const dueCards = (cards: readonly Card[], today: string): Card[] =>
  cards.filter((card) => dayOf(card.due) <= today);

export interface Counted {
  due: number;
  total: number;
}

function countOf(data: StudyData, lessons: readonly Lesson[], today: string): Counted {
  const ids = new Set(lessons.map((lesson) => lesson.id));
  const cards = data.cards.filter((card) => ids.has(card.lessonId));
  return { total: cards.length, due: dueCards(cards, today).length };
}

const hasCards = (data: StudyData, lesson: Lesson): boolean =>
  data.cards.some((card) => card.lessonId === lesson.id);

export interface Choice extends Counted {
  id: string;
  label: string;
}

// Só os anos que têm cartões, na ordem em que existem.
export function yearChoices(data: StudyData, today: string): Choice[] {
  return data.years
    .map((year) => ({
      id: year.id,
      label: year.name,
      ...countOf(
        data,
        data.lessons.filter((lesson) => yearOf(data, lesson) === year.id),
        today,
      ),
    }))
    .filter((choice) => choice.total > 0);
}

// Só os bimestres que têm cartões, juntados pelo nome entre as matérias.
export function periodChoices(data: StudyData, today: string): Choice[] {
  const names = new Map<string, string>();
  const folders = [...data.folders].sort((a, b) => a.order - b.order);
  for (const folder of folders) {
    const key = periodKey(folder.name);
    if (!names.has(key)) names.set(key, folder.name);
  }
  if (data.lessons.some((lesson) => lesson.folderId === null)) names.set(LOOSE_KEY, LOOSE_LABEL);
  return [...names]
    .map(([id, label]) => ({
      id,
      label,
      ...countOf(
        data,
        data.lessons.filter((lesson) => folderKey(data, lesson) === id),
        today,
      ),
    }))
    .filter((choice) => choice.total > 0);
}

export function toggleIn(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

// Desmarcar a disciplina desmarca as aulas dela: aula marcada sem disciplina ficaria escondida.
export function toggleSubject(data: StudyData, scope: Scope, subjectId: string): Scope {
  const subjects = toggleIn(scope.subjects, subjectId);
  if (subjects.length > scope.subjects.length) return { ...scope, subjects };
  const own = new Set(data.lessons.filter((l) => l.subjectId === subjectId).map((l) => l.id));
  return { ...scope, subjects, lessons: scope.lessons.filter((id) => !own.has(id)) };
}

export interface LessonRow extends Counted {
  id: string;
  label: string;
  checked: boolean;
}

export interface LessonGroup {
  id: string;
  subjectId: string;
  code: string;
  color: number;
  label: string;
  due: number;
  rows: LessonRow[];
}

// Aulas das disciplinas marcadas, em grupos de disciplina e bimestre. Só as que têm cartões;
// com bimestre marcado, só os dele.
export function lessonGroups(data: StudyData, scope: Scope, today: string): LessonGroup[] {
  const groups: LessonGroup[] = [];
  for (const subject of data.subjects) {
    if (!scope.subjects.includes(subject.id)) continue;
    const lessons = data.lessons
      .filter((lesson) => lesson.subjectId === subject.id && hasCards(data, lesson))
      .filter((lesson) => allows(scope.periods, folderKey(data, lesson)));
    const folders = data.folders
      .filter((folder) => folder.subjectId === subject.id)
      .sort((a, b) => a.order - b.order);
    const parts = [
      ...folders.map((folder) => ({ id: folder.id, label: folder.name })),
      { id: 'sem', label: LOOSE_LABEL },
    ];
    for (const part of parts) {
      const inside = lessons
        .filter((lesson) => (lesson.folderId ?? 'sem') === part.id)
        .sort((a, b) => a.date.localeCompare(b.date));
      if (inside.length === 0) continue;
      groups.push({
        id: `${subject.id}:${part.id}`,
        subjectId: subject.id,
        code: subject.code,
        color: subject.color,
        label: part.label,
        due: countOf(data, inside, today).due,
        rows: inside.map((lesson) => ({
          id: lesson.id,
          label: lesson.title,
          checked: scope.lessons.includes(lesson.id),
          ...countOf(data, [lesson], today),
        })),
      });
    }
  }
  return groups;
}

// Frase curta do recorte, usada no nome do arquivo exportado: "2º ano · IMU · 1º bimestre".
export function describeScope(data: StudyData, scope: Scope): string {
  if (isEmptyScope(scope)) return 'Todos os cartões';
  const years = data.years.filter((year) => scope.years.includes(year.id)).map((year) => year.name);
  const periods = periodChoices(data, '')
    .filter((c) => scope.periods.includes(c.id))
    .map((c) => c.label);
  const subjects = data.subjects.filter((s) => scope.subjects.includes(s.id)).map((s) => s.code);
  const lessons = scope.lessons.length;
  const parts = [...years, ...periods, ...subjects];
  if (lessons > 0) parts.push(lessons === 1 ? '1 aula' : `${lessons} aulas`);
  return parts.join(' · ');
}

// Filtros lembrados entre uma abertura e outra: texto no banco do aparelho.
export function parseScope(text: string | undefined): Scope {
  if (!text) return emptyScope();
  try {
    const raw = JSON.parse(text) as Partial<Record<keyof Scope, unknown>>;
    const list = (value: unknown): string[] =>
      Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
    return {
      years: list(raw.years),
      periods: list(raw.periods),
      subjects: list(raw.subjects),
      lessons: list(raw.lessons),
    };
  } catch {
    return emptyScope();
  }
}

export const stringifyScope = (scope: Scope): string => JSON.stringify(scope);

// Tira do recorte o que não existe mais (matéria, aula ou ano apagados).
export function pruneScope(data: StudyData, scope: Scope): Scope {
  const keep = (list: readonly string[], valid: ReadonlySet<string>): string[] =>
    list.filter((id) => valid.has(id));
  return {
    years: keep(scope.years, new Set(data.years.map((year) => year.id))),
    periods: keep(scope.periods, new Set(periodChoices(data, '').map((choice) => choice.id))),
    subjects: keep(scope.subjects, new Set(data.subjects.map((subject) => subject.id))),
    lessons: keep(scope.lessons, new Set(data.lessons.map((lesson) => lesson.id))),
  };
}
