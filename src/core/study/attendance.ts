import { addDays, daysBetween } from './dates';
import { toHours } from './agenda';
import { eventsOn } from './queries';
import type { Attendance, StudyData } from './types';

// Aprovação por frequência: pelo menos 75% de presença (D100).
export const MIN_PRESENCE = 0.75;
const EPSILON = 1e-9;

// Aulas são feitas de blocos de 1 hora; 50 minutos de aula ainda é 1 bloco.
export function blocksOf(start: string, end: string): number {
  return Math.max(1, Math.round(toHours(end) - toHours(start)));
}

export interface Occurrence {
  subjectId: string;
  date: string;
  start: string;
  end: string;
  blocks: number;
  record: Attendance | undefined;
}

export function findRecord(
  data: StudyData,
  subjectId: string,
  date: string,
  start: string,
): Attendance | undefined {
  return data.attendance.find(
    (item) => item.subjectId === subjectId && item.date === date && item.start === start,
  );
}

// Aulas da matéria que já terminaram, do início da contagem até agora (Grade e Agenda).
export function pastOccurrences(
  data: StudyData,
  subjectId: string,
  from: string,
  today: string,
  now: string,
): Occurrence[] {
  const days = daysBetween(from, today);
  const result: Occurrence[] = [];
  for (let step = 0; step <= days; step += 1) {
    const date = addDays(from, step);
    for (const event of eventsOn(data, date)) {
      if (event.kind !== 'aula' || event.subjectId !== subjectId) continue;
      if (date === today && event.end > now) continue;
      result.push({
        subjectId,
        date,
        start: event.start,
        end: event.end,
        blocks: blocksOf(event.start, event.end),
        record: findRecord(data, subjectId, date, event.start),
      });
    }
  }
  return result;
}

export type PresenceStatus = 'sem-aulas' | 'ok' | 'limite' | 'abaixo';

export interface Presence {
  // Blocos de 1h dados, sem as aulas canceladas.
  total: number;
  missed: number;
  cancelled: number;
  // null enquanto não houve aula.
  percent: number | null;
  // Horas que ainda pode faltar sem passar de 25% do total até agora (negativo: já passou).
  margin: number;
  status: PresenceStatus;
}

export function presenceOf(occurrences: readonly Occurrence[]): Presence {
  let total = 0;
  let missed = 0;
  let cancelled = 0;
  for (const item of occurrences) {
    if (item.record?.cancelled) {
      cancelled += item.blocks;
      continue;
    }
    total += item.blocks;
    missed += Math.min(item.record?.missed ?? 0, item.blocks);
  }
  const percent = total === 0 ? null : (total - missed) / total;
  const margin = Math.floor((total * (1 - MIN_PRESENCE) - missed + EPSILON) * 2) / 2;
  let status: PresenceStatus = 'ok';
  if (percent === null) status = 'sem-aulas';
  else if (missed > total * (1 - MIN_PRESENCE) + EPSILON) status = 'abaixo';
  else if (margin < 1) status = 'limite';
  return { total, missed, cancelled, percent, margin, status };
}

export type Situation =
  { kind: 'presente' } | { kind: 'falta'; hours: number } | { kind: 'cancelada' };

export function situationOf(item: Occurrence): Situation {
  if (item.record?.cancelled) return { kind: 'cancelada' };
  if (item.record && item.record.missed > 0) return { kind: 'falta', hours: item.record.missed };
  return { kind: 'presente' };
}

// Presente apaga o registro: aula sem registro conta como presença.
export function markOccurrence(
  data: StudyData,
  item: Occurrence,
  situation: Situation,
  newId: string,
): StudyData {
  const others = data.attendance.filter(
    (record) =>
      !(
        record.subjectId === item.subjectId &&
        record.date === item.date &&
        record.start === item.start
      ),
  );
  if (situation.kind === 'presente') return { ...data, attendance: others };
  const record: Attendance = {
    id: item.record?.id ?? newId,
    subjectId: item.subjectId,
    date: item.date,
    start: item.start,
    missed: situation.kind === 'falta' ? Math.min(situation.hours, item.blocks) : 0,
    cancelled: situation.kind === 'cancelada',
  };
  return { ...data, attendance: [...others, record] };
}

export function setClassesFrom(data: StudyData, subjectId: string, date: string): StudyData {
  return {
    ...data,
    subjects: data.subjects.map((subject) =>
      subject.id === subjectId ? { ...subject, classesFrom: date } : subject,
    ),
  };
}
