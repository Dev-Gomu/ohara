import { daysBetween, monthName, parseDay, shortDate } from '../../../core/study/dates';
import { isNow, subjectOf } from '../../../core/study/queries';
import type { ClassEvent, Exam, Reminder } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { NavItem } from '../../components/NavItem';
import { dispatch } from '../../keyboard/store';
import { openLesson } from '../../study/navigation';
import { nowTime, today, useStudy } from '../../study/study';
import styles from './Hub.module.css';

export function ExamsBlock({ id, exams }: { id: string; exams: readonly Exam[] }) {
  const data = useStudy();
  return (
    <Block id={id} label="Provas" className={styles.semFundo}>
      <div className={styles.provas}>
        {exams.map((exam, index) => {
          const subject = subjectOf(data, exam.subjectId);
          return (
            <NavItem key={exam.id} block={id} index={index} className={styles.prova} ring="anel">
              <span className={styles.preenche} data-materia={subject?.color}>
                <span className={styles.dias}>
                  {daysBetween(today, exam.date)} <small>dias</small>
                </span>
                <b className={styles.provaNome}>{subject?.name}</b>
                <span className={styles.provaData}>
                  {shortDate(exam.date)}, {exam.time}
                </span>
              </span>
            </NavItem>
          );
        })}
      </div>
    </Block>
  );
}

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

interface CalendarProps {
  id: string;
  days: readonly string[];
  exams: readonly Exam[];
}

export function CalendarBlock({ id, days, exams }: CalendarProps) {
  const month = parseDay(today).getMonth();
  return (
    <Block id={id} title={monthName(today)} label="Calendário" count={today.slice(0, 4)} menu>
      <div className={styles.calendario}>
        {WEEK.map((day, index) => (
          <span key={index} className={styles.semana}>
            {day}
          </span>
        ))}
        {days.map((day, index) => (
          <NavItem key={day} block={id} index={index} className={styles.dia} label={shortDate(day)}>
            <span
              className={styles.numero}
              data-hoje={day === today}
              data-prova={exams.some((exam) => exam.date === day)}
              data-fora={parseDay(day).getMonth() !== month}
            >
              {parseDay(day).getDate()}
            </span>
          </NavItem>
        ))}
      </div>
    </Block>
  );
}

export function TodayBlock({ id, events }: { id: string; events: readonly ClassEvent[] }) {
  const data = useStudy();
  return (
    <Block id={id} title="Agenda de hoje" shortcut="Enter abre" menu>
      <div className={styles.lista}>
        {events.length === 0 && <p className={styles.vazio}>Sem aulas hoje.</p>}
        {events.map((event, index) => {
          const subject = subjectOf(data, event.subjectId);
          return (
            <NavItem
              key={event.id}
              block={id}
              index={index}
              className={styles.aula}
              onOpen={() => {
                if (event.lessonId) openLesson(event.lessonId);
              }}
            >
              <span className={styles.aulaCorpo} data-agora={isNow(event, today, today, nowTime)}>
                <span className={styles.hora}>
                  {event.start}–{event.end}
                </span>
                <span className={styles.aulaTexto}>
                  <b className={styles.aulaNome}>{subject?.name ?? event.title}</b>
                  <span className={styles.aulaTema}>{event.title}</span>
                </span>
                {subject && (
                  <span className={styles.sigla} data-materia={subject.color}>
                    {subject.code}
                  </span>
                )}
              </span>
            </NavItem>
          );
        })}
      </div>
    </Block>
  );
}

interface RemindersProps {
  id: string;
  reminders: readonly Reminder[];
  onToggle: (id: string) => void;
}

export function RemindersBlock({ id, reminders, onToggle }: RemindersProps) {
  return (
    <Block id={id} title="Lembretes" shortcut="Alt I" menu>
      <div className={styles.lista}>
        {reminders.length === 0 && <p className={styles.vazio}>Nada para hoje.</p>}
        {reminders.map((item, index) => (
          <NavItem
            key={item.id}
            block={id}
            index={index}
            className={styles.lembrete}
            onOpen={() => onToggle(item.id)}
          >
            <span className={styles.bola} data-feito={item.done} aria-hidden />
            <span className={styles.lembreteTexto} data-feito={item.done}>
              {item.text}
            </span>
          </NavItem>
        ))}
      </div>
      <button
        type="button"
        className={styles.novo}
        onClick={() => dispatch({ type: 'quickReminder' })}
      >
        Novo lembrete
      </button>
    </Block>
  );
}
