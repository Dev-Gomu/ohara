import type { Draft } from './cardText';
import type {
  Card,
  ClassEvent,
  EventKind,
  Exam,
  Folder,
  Lesson,
  Slot,
  StudyData,
  Subject,
} from './types';

export const SUBJECT_COLORS = 8;

export function subjectCode(name: string): string {
  const letters = name
    .normalize('NFD')
    .replace(/[^\p{L}]/gu, '')
    .toUpperCase();
  return letters.slice(0, 3);
}

// Próxima cor menos usada no ano, para matérias vizinhas não repetirem à toa.
export function nextColor(subjects: readonly Subject[]): number {
  const uses = Array.from({ length: SUBJECT_COLORS }, (_, color) => ({
    color,
    count: subjects.filter((subject) => subject.color === color).length,
  }));
  return uses.reduce((best, item) => (item.count < best.count ? item : best)).color;
}

export function addSubject(data: StudyData, id: string, yearId: string, name: string): StudyData {
  const year = data.subjects.filter((subject) => subject.yearId === yearId);
  const subject: Subject = {
    id,
    yearId,
    name,
    code: subjectCode(name),
    color: nextColor(year),
    lastAccess: null,
  };
  return { ...data, subjects: [...data.subjects, subject] };
}

export function addFolder(data: StudyData, id: string, subjectId: string, name: string): StudyData {
  const order = data.folders.filter((folder) => folder.subjectId === subjectId).length + 1;
  const folder: Folder = { id, subjectId, name, order };
  return { ...data, folders: [...data.folders, folder] };
}

export function addLesson(
  data: StudyData,
  id: string,
  subjectId: string,
  folderId: string | null,
  title: string,
  date: string,
): StudyData {
  const lesson: Lesson = { id, subjectId, folderId, title, date, slides: 0, notes: '' };
  return { ...data, lessons: [...data.lessons, lesson] };
}

export function addExam(data: StudyData, exam: Exam): StudyData {
  return { ...data, exams: [...data.exams, exam] };
}

export function addSlot(data: StudyData, slot: Slot): StudyData {
  return { ...data, slots: [...data.slots, slot] };
}

export function addEvent(
  data: StudyData,
  id: string,
  kind: EventKind,
  title: string,
  date: string,
  start: string,
  end: string,
): StudyData {
  const event: ClassEvent = { id, kind, subjectId: '', lessonId: null, title, date, start, end };
  return { ...data, events: [...data.events, event] };
}

// Cartão novo entra vencido hoje: aparece no Treino do mesmo dia.
export function addCards(
  data: StudyData,
  lessonId: string,
  drafts: readonly Draft[],
  ids: readonly string[],
  today: string,
): StudyData {
  const cards: Card[] = drafts.map((draft, index) => ({
    id: ids[index] ?? `${lessonId}-${data.cards.length + index}`,
    lessonId,
    question: draft.front,
    answer: draft.back,
    due: today,
  }));
  return { ...data, cards: [...data.cards, ...cards] };
}
