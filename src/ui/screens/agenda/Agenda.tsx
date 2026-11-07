import {
  addDays,
  longDate,
  monthGrid,
  monthName,
  parseDay,
  shortDate,
  weekdayShort,
  weekOf,
} from '../../../core/study/dates';
import { eventsOn, subjectOf, upcomingExams } from '../../../core/study/queries';
import type { StudyData } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { Ruler } from '../../components/Ruler';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { AGENDA_MONTH, AGENDA_VIEWS, openLesson } from '../../study/navigation';
import { today, useStudy } from '../../study/study';
import styles from './Agenda.module.css';

const WEEK = 'agenda.semana';
const LIST = 'agenda.lista';
const DAY = 'agenda.dia';
const LIST_DAYS = 21;

const VIEWS = [
  { id: 'semana', title: 'Semana', detail: 'dias e aulas' },
  { id: 'mes', title: 'Mês', detail: monthName(today) },
  { id: 'lista', title: 'Lista', detail: `próximos ${LIST_DAYS} dias` },
];

function dayItems(data: StudyData, day: string) {
  return [
    ...upcomingExams(data, day)
      .filter((exam) => exam.date === day)
      .map((exam) => ({
        id: exam.id,
        hour: exam.time,
        title: `Prova de ${subjectOf(data, exam.subjectId)?.name ?? ''}`,
        code: subjectOf(data, exam.subjectId)?.code,
        color: subjectOf(data, exam.subjectId)?.color,
        lessonId: null,
      })),
    ...eventsOn(data, day).map((event) => ({
      id: event.id,
      hour: event.start,
      title: event.title,
      code: subjectOf(data, event.subjectId)?.code,
      color: subjectOf(data, event.subjectId)?.color,
      lessonId: event.lessonId,
    })),
  ];
}

function DayCell({ data, day }: { data: StudyData; day: string }) {
  const items = dayItems(data, day);
  return (
    <>
      <span className={styles.cabeca} data-hoje={day === today}>
        {weekdayShort(day)} {parseDay(day).getDate()}
      </span>
      {items.map((item) => (
        <span key={item.id} className={styles.evento} data-materia={item.color}>
          {item.hour} {item.code}
        </span>
      ))}
    </>
  );
}

export function Agenda() {
  const data = useStudy();
  const view = useSelectedIndex(AGENDA_VIEWS, VIEWS.length);
  const week = weekOf(today);
  const month = monthGrid(today);
  const list = Array.from({ length: LIST_DAYS }, (_, index) => addDays(today, index));
  const content = [WEEK, AGENDA_MONTH, LIST][view] ?? WEEK;
  const days = [week, month, list][view] ?? week;
  const dayIndex = useSelectedIndex(content, days.length);
  const day = days[dayIndex] ?? today;
  const items = dayItems(data, day);
  const open = (index: number) => {
    const lessonId = items[index]?.lessonId;
    if (lessonId) openLesson(lessonId);
  };

  useBlocks({
    blocks: [
      {
        id: AGENDA_VIEWS,
        kind: 'nav',
        nav: { axis: 'x', count: VIEWS.length },
        neighbors: { down: content },
        enterGoesTo: content,
        enterKeepsItem: true,
      },
      {
        id: content,
        kind: 'nav',
        nav: {
          axis: view === 2 ? 'y' : view === 0 ? 'x' : 'grid',
          count: days.length,
          columns: 7,
        },
        neighbors: { up: AGENDA_VIEWS, right: DAY },
      },
      {
        id: DAY,
        kind: 'nav',
        nav: { axis: 'y', count: items.length },
        neighbors: { left: content, up: AGENDA_VIEWS },
        onActivate: open,
      },
    ],
    arrival: {
      block: WEEK,
      level: 'nav',
      items: {
        [WEEK]: week.indexOf(today),
        [AGENDA_MONTH]: month.indexOf(today),
        [LIST]: 0,
      },
    },
  });

  return (
    <ScreenFrame title="Agenda">
      <div className={styles.agenda}>
        <Block id={AGENDA_VIEWS} className={styles.regua}>
          <Ruler block={AGENDA_VIEWS} items={VIEWS} />
        </Block>
        <Block id={content}>
          <div className={styles[['semana', 'mes', 'lista'][view] ?? 'semana']}>
            {days.map((item, index) => (
              <NavItem
                key={item}
                block={content}
                index={index}
                className={styles.dia}
                label={shortDate(item)}
              >
                <DayCell data={data} day={item} />
              </NavItem>
            ))}
          </div>
        </Block>
        <Block id={DAY} title={longDate(day)} count={String(items.length)}>
          <div className={styles.lista}>
            {items.length === 0 && <p className={styles.vazio}>Nada neste dia.</p>}
            {items.map((item, index) => (
              <NavItem
                key={item.id}
                block={DAY}
                index={index}
                className={styles.item}
                onOpen={() => open(index)}
              >
                <span className={styles.hora}>{item.hour}</span>
                <b className={styles.titulo}>{item.title}</b>
                <span className={styles.sigla} data-materia={item.color}>
                  {item.code}
                </span>
              </NavItem>
            ))}
          </div>
        </Block>
      </div>
    </ScreenFrame>
  );
}
