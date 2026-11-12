import {
  pastOccurrences,
  presenceOf,
  type Occurrence,
  type Presence,
} from '../../core/study/attendance';
import { isoDay } from '../../core/study/dates';
import type { StudyData, Subject } from '../../core/study/types';

export function subjectsOf(data: StudyData): Subject[] {
  const years = new Set(data.years.filter((year) => !year.archived).map((year) => year.id));
  return data.subjects.filter((subject) => years.has(subject.yearId));
}

export function occurrencesOf(data: StudyData, subject: Subject | undefined): Occurrence[] {
  if (!subject?.classesFrom) return [];
  const now = new Date();
  return pastOccurrences(
    data,
    subject.id,
    subject.classesFrom,
    isoDay(now),
    now.toTimeString().slice(0, 5),
  );
}

export interface FaultLine {
  subject: Subject;
  presence: Presence;
  // Horas faltadas e o limite até agora; null enquanto não houve aula.
  missed: number | null;
  limit: number | null;
  attention: boolean;
}

// Em atenção: no limite, abaixo de 75% ou com 3/4 do que podia faltar já usado.
export function faultLines(data: StudyData): FaultLine[] {
  return subjectsOf(data).map((subject) => {
    const presence = presenceOf(occurrencesOf(data, subject));
    if (presence.status === 'sem-aulas') {
      return { subject, presence, missed: null, limit: null, attention: false };
    }
    const limit = presence.missed + Math.max(presence.margin, 0);
    const attention =
      presence.status !== 'ok' || (limit > 0 && presence.missed >= limit * 0.75);
    return { subject, presence, missed: presence.missed, limit, attention };
  });
}
