import { daysBetween, parseDay } from './dates';
import type { ClassEvent, Exam, Folder, Lesson, Slot, StudyData, Subject } from './types';

export const ALL_FOLDERS = 'todas';
export const NO_FOLDER = 'sem';

export interface FolderTab {
  id: string;
  name: string;
  count: number;
}

export function lessonsOf(data: StudyData, subjectId: string): Lesson[] {
  return data.lessons
    .filter((lesson) => lesson.subjectId === subjectId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function foldersOf(data: StudyData, subjectId: string): Folder[] {
  return data.folders
    .filter((folder) => folder.subjectId === subjectId)
    .sort((a, b) => a.order - b.order);
}

export function folderTabs(data: StudyData, subjectId: string): FolderTab[] {
  const lessons = lessonsOf(data, subjectId);
  const loose = lessons.filter((lesson) => lesson.folderId === null).length;
  return [
    { id: ALL_FOLDERS, name: 'Todas', count: lessons.length },
    ...foldersOf(data, subjectId).map((folder) => ({
      id: folder.id,
      name: folder.name,
      count: lessons.filter((lesson) => lesson.folderId === folder.id).length,
    })),
    { id: NO_FOLDER, name: 'Sem bimestre', count: loose },
  ];
}

export function filterLessons(lessons: readonly Lesson[], tabId: string): Lesson[] {
  if (tabId === ALL_FOLDERS) return [...lessons];
  const folderId = tabId === NO_FOLDER ? null : tabId;
  return lessons.filter((lesson) => lesson.folderId === folderId);
}

// D76: abre no bimestre mais recente com aulas. Sem nenhum, abre em "Todas".
export function initialTabIndex(tabs: readonly FolderTab[], data: StudyData, id: string): number {
  const folders = foldersOf(data, id);
  for (let index = folders.length - 1; index >= 0; index -= 1) {
    const tab = tabs.findIndex((item) => item.id === folders[index]?.id);
    if ((tabs[tab]?.count ?? 0) > 0) return tab;
  }
  return 0;
}

export function cardCount(data: StudyData, lessonId: string): number {
  return data.cards.filter((card) => card.lessonId === lessonId).length;
}

export function folderName(data: StudyData, lesson: Lesson): string {
  const folder = data.folders.find((item) => item.id === lesson.folderId);
  return folder?.name ?? 'Sem bimestre';
}

export function subjectOf(data: StudyData, subjectId: string): Subject | undefined {
  return data.subjects.find((subject) => subject.id === subjectId);
}

export function upcomingExams(data: StudyData, today: string): Exam[] {
  return data.exams
    .filter((exam) => exam.date !== '' && daysBetween(today, exam.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface ExamDay {
  date: string;
  exams: Exam[];
}

export function upcomingExamDays(data: StudyData, today: string): ExamDay[] {
  const days: ExamDay[] = [];
  for (const exam of upcomingExams(data, today)) {
    const last = days[days.length - 1];
    if (last && last.date === exam.date) last.exams.push(exam);
    else days.push({ date: exam.date, exams: [exam] });
  }
  for (const day of days) day.exams.sort((a, b) => a.time.localeCompare(b.time));
  return days;
}

// Cartão do dia: 4 vagas fixas. Passou de 4, a última vira "+N" com as que não couberam.
export const EXAM_SLOTS = 4;

export interface ExamSlots {
  shown: Exam[];
  extra: number;
}

export function examSlots(exams: readonly Exam[], slots = EXAM_SLOTS): ExamSlots {
  if (exams.length <= slots) return { shown: [...exams], extra: 0 };
  return { shown: exams.slice(0, slots - 1), extra: exams.length - (slots - 1) };
}

function slotOccurs(slot: Slot, day: string): boolean {
  if (parseDay(day).getDay() !== slot.weekday) return false;
  if (slot.every === 1) return true;
  return Math.floor(Math.abs(daysBetween(slot.anchor, day)) / 7) % 2 === 0;
}

// Aula virtual: calculada da Grade. Uma aula real no mesmo horário toma o lugar dela.
function virtualEvents(data: StudyData, day: string, real: readonly ClassEvent[]): ClassEvent[] {
  return data.slots
    .filter((slot) => slotOccurs(slot, day))
    .filter((slot) => !real.some((e) => e.subjectId === slot.subjectId && e.start === slot.start))
    .map((slot) => ({
      id: `${slot.id}-${day}`,
      kind: 'aula' as const,
      subjectId: slot.subjectId,
      lessonId: null,
      title: slot.label,
      date: day,
      start: slot.start,
      end: slot.end,
    }));
}

export function eventsOn(data: StudyData, day: string): ClassEvent[] {
  const real = data.events.filter((event) => event.date === day);
  return [...real, ...virtualEvents(data, day, real)].sort((a, b) =>
    a.start.localeCompare(b.start),
  );
}

export function slotsOn(data: StudyData, weekday: number): Slot[] {
  return data.slots
    .filter((slot) => slot.weekday === weekday)
    .sort((a, b) => a.start.localeCompare(b.start));
}

// A aula de agora ou, fora de horário, a próxima do dia.
export function currentEventIndex(events: readonly ClassEvent[], time: string): number {
  const index = events.findIndex((event) => time < event.end);
  return index === -1 ? Math.max(0, events.length - 1) : index;
}

export function isNow(event: ClassEvent, day: string, today: string, time: string): boolean {
  return day === today && event.start <= time && time < event.end;
}
