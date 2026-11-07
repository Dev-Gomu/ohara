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
  notes: string;
}

export interface Card {
  id: string;
  lessonId: string;
  question: string;
  answer: string;
  due: string;
}

// Prova exige só a matéria; data e hora vazias aparecem em "A completar" (regras.md C3).
export interface Exam {
  id: string;
  subjectId: string;
  date: string;
  time: string;
}

export type EventKind = 'aula' | 'trabalho' | 'compromisso';

export interface ClassEvent {
  id: string;
  kind: EventKind;
  // Vazio em compromisso sem matéria.
  subjectId: string;
  lessonId: string | null;
  title: string;
  date: string;
  start: string;
  end: string;
}

// Regra semanal da Grade. As aulas futuras são calculadas dela, não gravadas.
export interface Slot {
  id: string;
  subjectId: string;
  weekday: number;
  start: string;
  end: string;
  every: 1 | 2;
  // Semana de referência da repetição quinzenal.
  anchor: string;
  label: string;
  room: string;
}

export interface Reminder {
  id: string;
  text: string;
  date: string;
  done: boolean;
}

export interface NoteVersion {
  id: string;
  lessonId: string;
  at: number;
  html: string;
}

// Anexo: os bytes ficam no OPFS, fora do banco, com o hash como nome (D31).
export type FileKind = 'slides' | 'livro';

export interface StudyFile {
  id: string;
  sha256: string;
  name: string;
  mime: string;
  size: number;
  pages: number;
  kind: FileKind;
  // Slides pertencem a uma aula; livro, a uma matéria (ou a uma aula, quando é capítulo).
  lessonId: string | null;
  subjectId: string | null;
}

export interface StudyData {
  years: Year[];
  subjects: Subject[];
  folders: Folder[];
  lessons: Lesson[];
  cards: Card[];
  exams: Exam[];
  events: ClassEvent[];
  slots: Slot[];
  reminders: Reminder[];
  files: StudyFile[];
  noteVersions: readonly NoteVersion[];
}
