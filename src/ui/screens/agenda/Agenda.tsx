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
import type { StudyData } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { Ruler } from '../../components/Ruler';
import { dispatch } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { toggleReminder } from '../../study/actions';
import { AGENDA_MONTH, AGENDA_VIEWS, openLesson } from '../../study/navigation';
import { today, useStudy } from '../../study/study';
import styles from './Agenda.module.css';
import { dayItems, weekdayItems } from './agendaData';
import { agendaOptions } from './agendaForms';

const WEEK = 'agenda.semana';
const LIST = 'agenda.lista';
const GRADE = 'agenda.grade';
const DAY = 'agenda.dia';
const REMINDERS = 'agenda.lembretes';
const LIST_DAYS = 21;
const WEEKDAY_NAMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const VIEWS = [
  { id: 'semana', title: 'Semana', detail: 'dias e aulas' },
  { id: 'mes', title: 'Mês', detail: monthName(today) },
  { id: 'lista', title: 'Lista', detail: `próximos ${LIST_DAYS} dias` },
  { id: 'grade', title: 'Grade', detail: 'horário da semana' },
];

function WeekdayCell({ data, index }: { data: StudyData; index: number }) {
  return (
    <>
      <span className={styles.cabeca}>{WEEKDAY_NAMES[index]}</span>
      {weekdayItems(data, index + 1).map((item) => (
        <span key={item.id} className={styles.evento} data-materia={item.color}>
          {item.hour} {item.code}
        </span>
      ))}
    </>
  );
}

function DayCell({ data, day }: { data: StudyData; day: string }) {
  const items = dayItems(data, day);
  return (
    <>
      <span className={styles.cabeca} data-hoje={day === today}>
        {weekdayShort(day)} {parseDay(day).getDate()}
      </span>
      {items.map((item) => (
        <span
          key={item.id}
          className={styles.evento}
          data-materia={item.color ?? 7}
          data-prova={item.exam}
        >
          {item.hour} {item.exam ? 'Prova ' : ''}
          {item.code ?? item.title}
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
  const onGrade = view === 3;
  const content = [WEEK, AGENDA_MONTH, LIST, GRADE][view] ?? WEEK;
  const days = [week, month, list, WEEKDAY_NAMES][view] ?? week;
  const dayIndex = useSelectedIndex(content, days.length);
  const day = onGrade ? today : (days[dayIndex] ?? today);
  const items = onGrade ? weekdayItems(data, dayIndex + 1) : dayItems(data, day);
  const reminders = data.reminders.filter((item) => !item.done);
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
          axis: view === 2 ? 'y' : view === 1 ? 'grid' : 'x',
          count: days.length,
          columns: 7,
        },
        neighbors: { up: AGENDA_VIEWS, right: DAY },
      },
      {
        id: DAY,
        kind: 'nav',
        nav: { axis: 'y', count: items.length },
        neighbors: { left: content, up: AGENDA_VIEWS, down: REMINDERS },
        onActivate: open,
      },
      {
        id: REMINDERS,
        kind: 'nav',
        nav: { axis: 'y', count: reminders.length },
        neighbors: { left: content, up: DAY },
        onActivate: (index) => toggleReminder(reminders[index]?.id),
      },
    ],
    arrival: {
      block: WEEK,
      level: 'nav',
      items: {
        [WEEK]: week.indexOf(today),
        [AGENDA_MONTH]: month.indexOf(today),
        [LIST]: 0,
        [GRADE]: 0,
      },
    },
    options: () => agendaOptions(data, day),
    actions: { newItem: () => dispatch({ type: 'openOptions' }) },
  });

  return (
    <ScreenFrame title="Agenda">
      <div className={styles.agenda}>
        <Block id={AGENDA_VIEWS} className={styles.regua}>
          <Ruler block={AGENDA_VIEWS} items={VIEWS} />
        </Block>
        <Block id={content} className={styles.conteudo}>
          <div className={styles[['semana', 'mes', 'lista', 'grade'][view] ?? 'semana']}>
            {days.map((item, index) => (
              <NavItem
                key={item}
                block={content}
                index={index}
                className={styles.dia}
                label={onGrade ? item : shortDate(item)}
              >
                {onGrade ? (
                  <WeekdayCell data={data} index={index} />
                ) : (
                  <DayCell data={data} day={item} />
                )}
              </NavItem>
            ))}
          </div>
        </Block>
        <Block
          id={DAY}
          title={onGrade ? WEEKDAY_NAMES[dayIndex] : longDate(day)}
          count={String(items.length)}
          shortcut="Alt N"
          menu
        >
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
                {item.code !== undefined && (
                  <span className={styles.sigla} data-materia={item.color}>
                    {item.code}
                  </span>
                )}
              </NavItem>
            ))}
          </div>
        </Block>
        <Block id={REMINDERS} title="Lembretes" count={String(reminders.length)} shortcut="Alt I">
          <div className={styles.lista}>
            {reminders.length === 0 && <p className={styles.vazio}>Nada pendente.</p>}
            {reminders.map((item, index) => (
              <NavItem
                key={item.id}
                block={REMINDERS}
                index={index}
                className={styles.lembrete}
                onOpen={() => toggleReminder(item.id)}
              >
                {item.text}
              </NavItem>
            ))}
          </div>
        </Block>
      </div>
    </ScreenFrame>
  );
}
