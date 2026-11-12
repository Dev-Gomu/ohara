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
import { Button } from '../../components/Button';
import { Day } from '../../components/Controls';
import { ListItem } from '../../components/ListItem';
import { NowPill, StatePill, SubjectPill } from '../../components/Pill';
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
  const data = useStudy();
  const month = parseDay(today).getMonth();
  return (
    <Block id={id} title={monthName(today)} label="Calendário" count={today.slice(0, 4)} menu>
      <div className={styles.calendario}>
        {WEEK.map((day, index) => (
          <span key={index} className={styles.semana}>
            {day}
          </span>
        ))}
        {days.map((day, index) => {
          const exam = exams.find((item) => item.date === day);
          const color = exam ? subjectOf(data, exam.subjectId)?.color : undefined;
          return (
            <Day
              key={day}
              nav={{ block: id, index }}
              label={shortDate(day)}
              day={parseDay(day).getDate()}
              today={day === today}
              dim={parseDay(day).getMonth() !== month}
              {...(color !== undefined && { subject: color })}
            />
          );
        })}
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
            <ListItem
              key={event.id}
              nav={{ block: id, index }}
              time={`${event.start}–${event.end}`}
              title={event.title}
              quietSelection
              onOpen={() => {
                if (event.lessonId) openLesson(event.lessonId);
              }}
            >
              {isNow(event, today, today, nowTime) && <NowPill />}
              {subject && <SubjectPill code={subject.code} color={subject.color} />}
            </ListItem>
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
          <ListItem
            key={item.id}
            nav={{ block: id, index }}
            title={item.text}
            past={item.done}
            quietSelection
            onOpen={() => onToggle(item.id)}
          >
            {item.done && <StatePill state="ok">feito</StatePill>}
          </ListItem>
        ))}
      </div>
      <div className={styles.novo}>
        <Button variant="primary" onPress={() => dispatch({ type: 'quickReminder' })}>
          Novo lembrete
        </Button>
      </div>
    </Block>
  );
}
