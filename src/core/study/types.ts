export interface Year {
  id: string;
  name: string;
  archived: boolean;
}

export interface Subject {
  id: string;
  yearId: string;
  name: string;
  code: string;
  // Posição na paleta, nunca o valor da cor: o tema pode mudar sem mexer nos dados.
  color: number;
  lastAccess: string | null;
}

export interface Folder {
  id: string;
  subjectId: string;
  name: string;
  order: number;
}

export interface Lesson {
  id: string;
  subjectId: string;
  folderId: string | null;
  title: string;
  date: string;
  slides: number;
  notes: string;
}

export interface Card {
  id: string;
  lessonId: string;
  question: string;
  answer: string;
  due: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  date: string;
  time: string;
}

export interface ClassEvent {
  id: string;
  subjectId: string;
  lessonId: string | null;
  title: string;
  date: string;
  start: string;
  end: string;
}

export interface Reminder {
  id: string;
  text: string;
  date: string;
  done: boolean;
}

export interface NoteVersion {
  lessonId: string;
  at: number;
  html: string;
}

export interface StudyData {
  years: Year[];
  subjects: Subject[];
  folders: Folder[];
  lessons: Lesson[];
  cards: Card[];
  exams: Exam[];
  events: ClassEvent[];
  reminders: Reminder[];
  noteVersions: readonly NoteVersion[];
}
