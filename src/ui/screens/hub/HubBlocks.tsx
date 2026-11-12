import {
  daysBetween,
  longDate,
  monthName,
  monthShort,
  parseDay,
  shortDate,
  weekdayShort,
} from '../../../core/study/dates';
import { eventsOn, isNow, subjectOf, type AssessmentDay } from '../../../core/study/queries';
import type { ClassEvent, Exam, Reminder, StudyData } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { AssessmentDayCard } from '../../components/Cards';
import { Button } from '../../components/Button';
import { Day } from '../../components/Controls';
import { DayItem } from '../../components/DayItem';
import { FaultCell } from '../../components/FaultCell';
import { ListItem } from '../../components/ListItem';
import { useSelectedIndex } from '../../components/NavItem';
import { NowPill, StatePill, SubjectMark } from '../../components/Pill';
import type { FaultLine } from '../../faltas/summary';
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
              month={monthShort(day.date)}
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
  const chosen = days[useSelectedIndex(id, days.length)] ?? today;
  const rows = dayRows(data, chosen);
  const away = daysBetween(today, chosen);
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
      <p className={styles.doDia}>
        <b>{longDate(chosen)}</b>
        {away === 0 ? ' · hoje' : away > 0 ? ` · em ${away} dias` : ''}
      </p>
      <div className={styles.eventos}>
        {rows.length === 0 && <p className={styles.vazio}>Nada neste dia.</p>}
        {rows.map((row) => (
          <div key={row.key} className={styles.evento}>
            <time>{row.time}</time>
            <span className={styles.eventoTitulo}>{row.title}</span>
            {row.code && <SubjectMark code={row.code} color={row.color} />}
          </div>
        ))}
      </div>
    </Block>
  );
}

interface DayRow {
  key: string;
  time: string;
  title: string;
  code: string;
  color: number | undefined;
}

// Aulas, compromissos e provas do dia escolhido, em ordem de hora.
function dayRows(data: StudyData, day: string): DayRow[] {
  const events = eventsOn(data, day).map((event) => {
    const subject = subjectOf(data, event.subjectId);
    return {
      key: event.id,
      time: event.start,
      title: event.title,
      code: subject?.code ?? '',
      color: subject?.color,
    };
  });
  const exams = data.exams
    .filter((exam) => exam.date === day)
    .map((exam) => {
      const subject = subjectOf(data, exam.subjectId);
      return {
        key: exam.id,
        time: exam.time,
        title: 'Prova',
        code: subject?.code ?? '',
        color: subject?.color,
      };
    });
  return [...events, ...exams].sort((a, b) => a.time.localeCompare(b.time));
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
            <DayItem
              key={event.id}
              nav={{ block: id, index }}
              start={event.start}
              end={event.end}
              title={event.title}
              code={subject?.code ?? ''}
              color={subject?.color}
              past={event.end <= nowTime && event.date === today}
              onOpen={() => {
                if (event.lessonId) openLesson(event.lessonId);
              }}
            >
              {isNow(event, today, today, nowTime) && <NowPill />}
            </DayItem>
          );
        })}
      </div>
    </Block>
  );
}

export function FaultsBlock({ id, lines }: { id: string; lines: readonly FaultLine[] }) {
  return (
    <Block id={id} title="Faltas" label="Faltas" menu>
      <div className={styles.faltas}>
        {lines.length === 0 && <p className={styles.vazio}>Nenhuma matéria ainda.</p>}
        {lines.map((line, index) => (
          <FaultCell
            key={line.subject.id}
            nav={{ block: id, index }}
            label={`${line.subject.code}: ${line.missed ?? 0} de ${line.limit ?? 0} horas${line.attention ? ', atenção' : ''}`}
            code={line.subject.code}
            missed={line.missed}
            limit={line.limit}
            attention={line.attention}
          />
        ))}
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
