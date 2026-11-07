import { subjectCode } from './create';
import type { StudyData } from './types';

export function renameSubject(data: StudyData, id: string, name: string): StudyData {
  return {
    ...data,
    subjects: data.subjects.map((item) =>
      item.id === id ? { ...item, name, code: subjectCode(name) } : item,
    ),
  };
}

export function renameFolder(data: StudyData, id: string, name: string): StudyData {
  return {
    ...data,
    folders: data.folders.map((item) => (item.id === id ? { ...item, name } : item)),
  };
}

export function editLesson(data: StudyData, id: string, title: string, date: string): StudyData {
  return {
    ...data,
    lessons: data.lessons.map((item) => (item.id === id ? { ...item, title, date } : item)),
    // A aula na Agenda acompanha o título e a data.
    events: data.events.map((item) => (item.lessonId === id ? { ...item, title, date } : item)),
  };
}

export function editCard(data: StudyData, id: string, question: string, answer: string): StudyData {
  return {
    ...data,
    cards: data.cards.map((item) => (item.id === id ? { ...item, question, answer } : item)),
  };
}

export function removeCard(data: StudyData, id: string): StudyData {
  return { ...data, cards: data.cards.filter((item) => item.id !== id) };
}

// Excluir a aula leva os cartões. O que ela marcou na Agenda continua, sem aula ligada.
export function removeLesson(data: StudyData, id: string): StudyData {
  return {
    ...data,
    lessons: data.lessons.filter((item) => item.id !== id),
    cards: data.cards.filter((item) => item.lessonId !== id),
    events: data.events.map((item) => (item.lessonId === id ? { ...item, lessonId: null } : item)),
  };
}

// Excluir a pasta não leva as aulas: elas ficam em "Sem bimestre".
export function removeFolder(data: StudyData, id: string): StudyData {
  return {
    ...data,
    folders: data.folders.filter((item) => item.id !== id),
    lessons: data.lessons.map((item) =>
      item.folderId === id ? { ...item, folderId: null } : item,
    ),
  };
}

export function removeSubject(data: StudyData, id: string): StudyData {
  const lessonIds = new Set(
    data.lessons.filter((item) => item.subjectId === id).map((item) => item.id),
  );
  return {
    ...data,
    subjects: data.subjects.filter((item) => item.id !== id),
    folders: data.folders.filter((item) => item.subjectId !== id),
    lessons: data.lessons.filter((item) => item.subjectId !== id),
    cards: data.cards.filter((item) => !lessonIds.has(item.lessonId)),
    exams: data.exams.filter((item) => item.subjectId !== id),
    events: data.events.filter(
      (item) => item.subjectId !== id && !lessonIds.has(item.lessonId ?? ''),
    ),
    slots: data.slots.filter((item) => item.subjectId !== id),
  };
}

const COLLECTIONS = [
  'years',
  'subjects',
  'folders',
  'lessons',
  'cards',
  'exams',
  'events',
  'slots',
  'reminders',
] as const;

// Desfazer uma ação: `before` e `after` são os dados antes e logo depois dela. Volta o que a ação
// removeu ou mudou, sem tocar no que o usuário mexeu depois.
export function restoreRemoved(current: StudyData, before: StudyData, after: StudyData): StudyData {
  const next: Record<string, unknown> = { ...current };
  for (const key of COLLECTIONS) {
    const now = current[key] as readonly { id: string }[];
    const old = before[key] as readonly { id: string }[];
    const done = new Map((after[key] as readonly { id: string }[]).map((item) => [item.id, item]));
    const nowById = new Map(now.map((item) => [item.id, item]));
    const oldIds = new Set(old.map((item) => item.id));
    const merged: { id: string }[] = [];
    for (const item of old) {
      const present = nowById.get(item.id);
      if (present) merged.push(present === done.get(item.id) ? item : present);
      else if (!done.has(item.id)) merged.push(item);
    }
    next[key] = [...merged, ...now.filter((item) => !oldIds.has(item.id))];
  }
  return next as unknown as StudyData;
}
