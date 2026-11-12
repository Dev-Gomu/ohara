import { eventsOn, slotsOn, subjectOf } from '../../../core/study/queries';
import type { StudyData, Subject } from '../../../core/study/types';

export type AgendaKind = 'dia' | 'prova' | 'trabalho' | 'aula' | 'compromisso';

export interface AgendaItem {
  id: string;
  kind: AgendaKind;
  // Vazio na Grade, que é regra semanal e não tem data.
  day: string;
  start: string;
  end: string;
  title: string;
  detail: string;
  subject: Subject | undefined;
  lessonId: string | null;
  // Aula calculada da Grade, ainda sem registro próprio (regras.md G2).
  virtual: boolean;
}

export interface AgendaColumn {
  key: string;
  day: string;
  weekday: string;
  number: string;
  // O primeiro item é sempre o próprio dia: assim dia vazio também recebe o foco.
  items: AgendaItem[];
}

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function base(kind: AgendaKind, day: string, subject: Subject | undefined) {
  return { kind, day, subject, start: '', end: '', detail: '', lessonId: null, virtual: false };
}

function dayEntry(key: string, day: string, title: string): AgendaItem {
  return { ...base('dia', day, undefined), id: `dia-${key}`, title };
}

function allDay(data: StudyData, day: string): AgendaItem[] {
  const exams = data.exams
    .filter((exam) => exam.date === day)
    .map((exam) => {
      const subject = subjectOf(data, exam.subjectId);
      return {
        ...base('prova', day, subject),
        id: exam.id,
        start: exam.time,
        title: `Prova de ${subject?.name ?? ''}`,
      };
    });
  const works = data.events
    .filter((event) => event.date === day && event.kind === 'trabalho')
    .map((event) => ({
      ...base('trabalho', day, subjectOf(data, event.subjectId)),
      id: event.id,
      start: event.start,
      title: event.title,
    }));
  return [...exams, ...works];
}

export function timedItems(data: StudyData, day: string): AgendaItem[] {
  return eventsOn(data, day)
    .filter((event) => event.kind !== 'trabalho')
    .map((event) => ({
      ...base(event.kind, day, subjectOf(data, event.subjectId)),
      id: event.id,
      start: event.start,
      end: event.end,
      title: event.title,
      lessonId: event.lessonId,
      virtual: !data.events.some((real) => real.id === event.id),
    }));
}

function matches(item: AgendaItem, subjectId: string | null): boolean {
  return subjectId === null || item.subject?.id === subjectId;
}

export function dayItems(data: StudyData, day: string, subjectId: string | null): AgendaItem[] {
  return [...allDay(data, day), ...timedItems(data, day)].filter((item) =>
    matches(item, subjectId),
  );
}

export function weekColumns(
  data: StudyData,
  days: readonly string[],
  subjectId: string | null,
): AgendaColumn[] {
  return days.map((day) => {
    const date = new Date(`${day}T12:00`);
    const weekday = date.getDay();
    return {
      key: day,
      day,
      weekday: WEEKDAYS[weekday] ?? '',
      number: String(date.getDate()),
      items: [
        dayEntry(day, day, `${WEEKDAY_NAMES[weekday] ?? ''}, ${date.getDate()}`),
        ...dayItems(data, day, subjectId),
      ],
    };
  });
}

// Grade: a mesma semana com horas, de segunda a sábado, feita só das regras.
export function gradeColumns(data: StudyData, subjectId: string | null): AgendaColumn[] {
  return [1, 2, 3, 4, 5, 6].map((weekday) => {
    const name = WEEKDAY_NAMES[weekday] ?? '';
    const slots = slotsOn(data, weekday).map((slot) => ({
      ...base('aula', '', subjectOf(data, slot.subjectId)),
      id: slot.id,
      start: slot.start,
      end: slot.end,
      title: slot.label,
      detail: [slot.every === 2 ? 'Quinzenal' : 'Toda semana', slot.room]
        .filter(Boolean)
        .join(' · '),
    }));
    return {
      key: name,
      day: '',
      weekday: WEEKDAYS[weekday] ?? '',
      number: '',
      items: [dayEntry(name, '', name), ...slots.filter((item) => matches(item, subjectId))],
    };
  });
}
