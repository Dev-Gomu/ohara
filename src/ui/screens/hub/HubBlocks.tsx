import {
  daysBetween,
  monthName,
  parseDay,
  shortDate,
  weekdayShort,
} from '../../../core/study/dates';
import { isNow, subjectOf, type AssessmentDay } from '../../../core/study/queries';
import type { ClassEvent, Exam, Reminder } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { AssessmentDayCard } from '../../components/Cards';
import { NavItem } from '../../components/NavItem';
import { dispatch } from '../../keyboard/store';
import { openLesson } from '../../study/navigation';
import { nowTime, today, useStudy } from '../../study/study';
import styles from './Hub.module.css';

function remaining(date: string): string {
  const days = daysBetween(today, date);
  return days === 0 ? 'hoje' : `em ${days} d`;
}

const KIND_LABEL = { prova: 'prova', trabalho: 'trabalho' } as const;

export function ExamsBlock({ id, days }: { id: string; days: readonly AssessmentDay[] }) {
  const data = useStudy();
  return (
    <Block id={id} label="Provas e trabalhos">
      <div className={styles.provas}>
        {days.map((day, index) => {
          const bricks = day.items.map((item) => {
            const subject = subjectOf(data, item.subjectId);
            return {
              code: subject?.code ?? '',
              color: subject?.color ?? 7,
              kind: KIND_LABEL[item.kind],
            };
          });
          const when = `${weekdayShort(day.date)} ${String(parseDay(day.date).getDate()).padStart(2, '0')}`;
          const spoken = bricks.map((brick) => `${brick.kind} de ${brick.code}`).join(', ');
          return (
            <AssessmentDayCard
              key={day.date}
              nav={{ block: id, index }}
              label={`${shortDate(day.date)}, ${remaining(day.date)}: ${spoken}`}
              when={when}
              due={remaining(day.date)}
              next={index === 0}
              bricks={bricks}
            />
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
