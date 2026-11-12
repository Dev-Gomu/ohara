import type { Exam, StudyData } from './types';

export interface TimeSpan {
  start: string;
  end: string;
}

export interface HourRange {
  first: number;
  last: number;
}

export function toHours(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours + minutes / 60;
}

// A semana mostra de 7h às 19h; aula fora disso alarga a faixa em vez de sumir.
export function hourRange(spans: readonly TimeSpan[], first = 7, last = 19): HourRange {
  return spans.reduce(
    (range, span) => ({
      first: Math.min(range.first, Math.floor(toHours(span.start))),
      last: Math.max(range.last, Math.ceil(toHours(span.end))),
    }),
    { first, last },
  );
}

export function missingFields(exam: Exam): string[] {
  return [exam.date === '' ? 'data' : '', exam.time === '' ? 'hora' : ''].filter(Boolean);
}

// Seção "A completar" (regras.md C4): sem data primeiro, depois pela data.
export function examsToComplete(data: StudyData): Exam[] {
  return data.exams
    .filter((exam) => missingFields(exam).length > 0)
    .sort((a, b) => (a.date === '' ? '' : a.date).localeCompare(b.date === '' ? '' : b.date));
}
