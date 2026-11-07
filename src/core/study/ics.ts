import { addDays } from './dates';
import { eventsOn, subjectOf } from './queries';
import type { StudyData } from './types';

const EXPORT_DAYS = 180;

function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function stamp(day: string, time: string): string {
  return `${day.replaceAll('-', '')}T${time.replace(':', '')}00`;
}

// O formato limita a linha a 75 caracteres; a continuação começa com espaço.
function fold(line: string): string {
  const parts: string[] = [];
  for (let start = 0; start < line.length; start += 74) parts.push(line.slice(start, start + 74));
  return parts.join('\r\n ');
}

function vevent(uid: string, day: string, start: string, end: string, summary: string): string[] {
  return [
    'BEGIN:VEVENT',
    `UID:${uid}@ohara`,
    `DTSTAMP:${stamp(day, start)}`,
    `DTSTART:${stamp(day, start)}`,
    `DTEND:${stamp(day, end)}`,
    `SUMMARY:${escapeText(summary)}`,
    'END:VEVENT',
  ];
}

function plusTwoHours(time: string): string {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  return `${String(Math.min(hour + 2, 23)).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function toIcs(data: StudyData, from: string): string {
  const days = Array.from({ length: EXPORT_DAYS }, (_, index) => addDays(from, index));
  const events = days.flatMap((day) =>
    eventsOn(data, day).flatMap((event) => {
      const name = subjectOf(data, event.subjectId)?.name;
      const summary = name ? `${name}: ${event.title}` : event.title;
      return vevent(event.id, day, event.start, event.end, summary);
    }),
  );
  const exams = data.exams.flatMap((exam) =>
    vevent(
      exam.id,
      exam.date,
      exam.time,
      plusTwoHours(exam.time),
      `Prova de ${subjectOf(data, exam.subjectId)?.name ?? ''}`,
    ),
  );
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ohara//Agenda//PT',
    ...events,
    ...exams,
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
