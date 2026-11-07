import { eventsOn, slotsOn, subjectOf } from '../../../core/study/queries';
import type { StudyData } from '../../../core/study/types';

export interface AgendaItem {
  id: string;
  hour: string;
  title: string;
  code: string | undefined;
  color: number | undefined;
  lessonId: string | null;
  exam: boolean;
}

export function dayItems(data: StudyData, day: string): AgendaItem[] {
  const exams = data.exams
    .filter((exam) => exam.date === day)
    .map((exam) => {
      const subject = subjectOf(data, exam.subjectId);
      return {
        id: exam.id,
        hour: exam.time,
        title: `Prova de ${subject?.name ?? ''}`,
        code: subject?.code,
        color: subject?.color,
        lessonId: null,
        exam: true,
      };
    });
  const events = eventsOn(data, day).map((event) => {
    const subject = subjectOf(data, event.subjectId);
    return {
      id: event.id,
      hour: event.start,
      title: event.title,
      code: subject?.code,
      color: subject?.color,
      lessonId: event.lessonId,
      exam: false,
    };
  });
  return [...exams, ...events].sort((a, b) => a.hour.localeCompare(b.hour));
}

export function weekdayItems(data: StudyData, weekday: number): AgendaItem[] {
  return slotsOn(data, weekday).map((slot) => {
    const subject = subjectOf(data, slot.subjectId);
    return {
      id: slot.id,
      hour: slot.start,
      title: [slot.label, slot.room].filter(Boolean).join(' · '),
      code: subject?.code,
      color: subject?.color,
      lessonId: null,
      exam: false,
    };
  });
}
