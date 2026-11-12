import { daysBetween, longDate, shortDate } from '../../core/study/dates';
import { eventsOn, subjectOf, upcomingExams } from '../../core/study/queries';
import { Window } from '../components/Window';
import { today, useStudy } from '../study/study';
import { CONSULT_WINDOWS } from './commands';
import styles from './ConsultWindows.module.css';

const [REMINDERS, DAY, CALENDAR, EXAMS] = CONSULT_WINDOWS;

// Janelas de consulta: olhar sem perder o lugar. Esc devolve ao ponto de origem.
export function ConsultWindows() {
  const data = useStudy();
  const reminders = data.reminders.filter((item) => !item.done);
  const events = eventsOn(data, today);
  const exams = upcomingExams(data, today);

  return (
    <>
      <Window id={REMINDERS.id} title={REMINDERS.title} testId={REMINDERS.id}>
        <ul className={styles.lista}>
          {reminders.length === 0 && <li className={styles.linha}>Nada pendente.</li>}
          {reminders.map((item) => (
            <li key={item.id} className={styles.linha}>
              {item.text}
            </li>
          ))}
        </ul>
      </Window>
      <Window id={DAY.id} title={DAY.title} testId={DAY.id}>
        <ul className={styles.lista}>
          {events.map((event) => (
            <li key={event.id} className={styles.linha}>
              <b>{event.start}</b> {subjectOf(data, event.subjectId)?.name}: {event.title}
            </li>
          ))}
        </ul>
      </Window>
      <Window id={CALENDAR.id} title={CALENDAR.title} testId={CALENDAR.id}>
        <p className={styles.linha}>Hoje é {longDate(today)}.</p>
        <ul className={styles.lista}>
          {exams.map((exam) => (
            <li key={exam.id} className={styles.linha}>
              {shortDate(exam.date)}: prova de {subjectOf(data, exam.subjectId)?.name}
            </li>
          ))}
        </ul>
      </Window>
      <Window id={EXAMS.id} title={EXAMS.title} testId={EXAMS.id}>
        <ul className={styles.lista}>
          {exams.map((exam) => (
            <li key={exam.id} className={styles.linha}>
              <b>{daysBetween(today, exam.date)} dias</b> {subjectOf(data, exam.subjectId)?.name},{' '}
              {shortDate(exam.date)} às {exam.time}
            </li>
          ))}
        </ul>
      </Window>
    </>
  );
}
