import { examsToComplete, missingFields } from '../../../core/study/agenda';
import {
  addDays,
  isoDay,
  monthGrid,
  monthName,
  mondayWeekOf,
  parseDay,
  shortDate,
  weekdayShort,
} from '../../../core/study/dates';
import { subjectOf } from '../../../core/study/queries';
import type { StudyData } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { Button } from '../../components/Button';
import { Key } from '../../components/Key';
import { ListItem } from '../../components/ListItem';
import { DayPill, SubjectMark, SubjectPill } from '../../components/Pill';
import { FilterChip, FilterGrid } from '../../components/Filter';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { Ruler } from '../../components/Ruler';
import { dispatch } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import {
  AGENDA_MONTH,
  AGENDA_DAY,
  AGENDA_VIEWS,
  FAULTS_OPEN,
  NOTES_OPEN,
} from '../../study/navigation';
import { useScreenMemory } from '../../study/screenMemory';
import { nowTime, today, useStudy } from '../../study/study';
import styles from './Agenda.module.css';
import { gradeColumns, weekColumns, type AgendaColumn } from './agendaData';
import { agendaOptions, askCompleteExam } from './agendaForms';
import { AgendaPreview, previewActions } from './AgendaPreview';
import { AgendaWeek } from './AgendaWeek';
import { Faltas } from '../../faltas/Faltas';
import { Notas } from '../../notas/Notas';

const WEEK = 'agenda.semana';
const LIST = 'agenda.lista';
const GRADE = 'agenda.grade';
const PREVIEW = 'agenda.previa';
const SUBJECTS = 'agenda.materias';
const COMPLETE = 'agenda.completar';
const LIST_DAYS = 21;
const SUBJECT_COLUMNS = 5;

function movePage(view: number, day: string, step: number): string {
  if (view === 1) {
    const date = parseDay(day);
    return isoDay(new Date(date.getFullYear(), date.getMonth() + step, 1));
  }
  return addDays(day, step * (view === 2 ? LIST_DAYS : 7));
}

function columnsFor(data: StudyData, view: number, anchor: string, subjectId: string | null) {
  if (view === 3) return gradeColumns(data, subjectId);
  if (view === 1) return weekColumns(data, monthGrid(anchor), subjectId);
  if (view === 2) {
    const days = Array.from({ length: LIST_DAYS }, (_, index) => addDays(anchor, index));
    return weekColumns(data, days, subjectId);
  }
  return weekColumns(data, mondayWeekOf(anchor), subjectId);
}

function DayCell({ column, list }: { column: AgendaColumn; list: boolean }) {
  return (
    <>
      <DayPill
        weekday={list ? weekdayShort(column.day).toUpperCase() : ''}
        number={list ? shortDate(column.day) : column.number}
        today={column.day === today}
      />
      <span className={styles.eventos}>
        {column.items.slice(1).map((item) => (
          <SubjectMark
            key={item.id}
            code={item.subject?.code ?? item.title}
            color={item.subject?.color}
          >
            {item.kind === 'prova' ? `Prova ${item.start}` : item.start}
          </SubjectMark>
        ))}
      </span>
    </>
  );
}

function viewItems(month: string) {
  return [
    { id: 'semana', title: 'Semana', detail: 'dias e horas' },
    { id: 'mes', title: 'Mês', detail: month },
    { id: 'lista', title: 'Lista', detail: `${LIST_DAYS} dias` },
    { id: 'grade', title: 'Grade', detail: 'horário fixo' },
  ];
}

export function Agenda() {
  const view = useSelectedIndex(AGENDA_VIEWS, 4);
  const [notes] = useScreenMemory(NOTES_OPEN, false);
  const [faults] = useScreenMemory(FAULTS_OPEN, false);
  if (notes) return <Notas />;
  if (faults) return <Faltas />;
  return <AgendaMain view={view} />;
}

function AgendaMain({ view }: { view: number }) {
  const data = useStudy();
  const [shown, setShown] = useScreenMemory(AGENDA_DAY, today);
  const open = data.years.filter((year) => !year.archived).map((year) => year.id);
  const subjects = data.subjects.filter((subject) => open.includes(subject.yearId));
  const subjectIndex = useSelectedIndex(SUBJECTS, subjects.length + 1);
  const subjectId = subjects[subjectIndex - 1]?.id ?? null;
  const anchor = shown;
  const columns = columnsFor(data, view, anchor, subjectId);
  const hours = view === 0 || view === 3;
  const content = [WEEK, AGENDA_MONTH, LIST, GRADE][view] ?? WEEK;
  const flat = hours ? columns.flatMap((column) => column.items) : columns.map((c) => c.items[0]);
  const selected = flat[useSelectedIndex(content, flat.length)];
  const selectedColumn = columns.find((column) => selected && column.items.includes(selected));
  const actions = previewActions(selected, data);
  const pending = examsToComplete(data);
  const todayColumn = columns.findIndex((column) => column.day === today);
  const before = columns.slice(0, Math.max(todayColumn, 0));
  const nowRow = columns[todayColumn]?.items.findIndex(
    (item) => item.start <= nowTime && nowTime < item.end,
  );
  const arrival =
    before.reduce((sum, column) => sum + column.items.length, 0) + Math.max(nowRow ?? 0, 0);
  const changePage = (step: number) => {
    if (view !== 3) setShown(movePage(view, shown, step));
  };
  const views = viewItems(monthName(view === 1 ? anchor : today));
  const period =
    view === 3
      ? 'Toda semana'
      : view === 1
        ? monthName(anchor)
        : `${shortDate(columns[0]?.day ?? today)} – ${shortDate(columns.at(-1)?.day ?? today)}`;

  useBlocks({
    blocks: [
      {
        id: AGENDA_VIEWS,
        kind: 'nav',
        nav: { axis: 'x', count: 4 },
        neighbors: { down: content },
        enterGoesTo: content,
        enterKeepsItem: true,
      },
      {
        id: content,
        kind: 'nav',
        nav: hours
          ? { axis: 'columns', count: flat.length, lengths: columns.map((c) => c.items.length) }
          : { axis: view === 2 ? 'y' : 'grid', count: flat.length, columns: 7 },
        neighbors: { up: AGENDA_VIEWS, right: PREVIEW },
        onActivate: () => actions[0]?.run(),
      },
      {
        id: PREVIEW,
        kind: 'nav',
        nav: { axis: 'x', count: actions.length },
        neighbors: { left: content, up: AGENDA_VIEWS, down: SUBJECTS },
        onActivate: (index) => actions[index]?.run(),
      },
      {
        id: SUBJECTS,
        kind: 'nav',
        nav: { axis: 'grid', count: subjects.length + 1, columns: SUBJECT_COLUMNS },
        neighbors: { left: content, up: PREVIEW, down: COMPLETE },
      },
      {
        id: COMPLETE,
        kind: 'nav',
        nav: { axis: 'y', count: pending.length },
        neighbors: { left: content, up: SUBJECTS },
        onActivate: (index) => askCompleteExam(data, pending[index]?.id ?? ''),
      },
    ],
    arrival: { block: WEEK, level: 'nav', items: { [WEEK]: arrival } },
    options: () => agendaOptions(data, selected?.day || today),
    actions: {
      newItem: () => dispatch({ type: 'openOptions' }),
      changePage: (change) => {
        if (change.type === 'changePage') changePage(change.step);
      },
    },
  });

  return (
    <ScreenFrame title="Agenda">
      <div className={styles.agenda}>
        <Block id={AGENDA_VIEWS} className={styles.regua}>
          <div className={styles.barra}>
            <Ruler block={AGENDA_VIEWS} items={views} />
            <div className={styles.periodo}>
              <Button label="Anterior" onPress={() => changePage(-1)}>
                ‹
              </Button>
              <Button onPress={() => setShown(today)}>Hoje</Button>
              <Button label="Próximo" onPress={() => changePage(1)}>
                ›
              </Button>
              <span className={styles.datas}>{period}</span>
              <Key>Alt PgUp PgDn</Key>
              <Button
                variant="primary"
                shortcut="Alt N"
                onPress={() => dispatch({ type: 'openOptions' })}
              >
                + Novo
              </Button>
            </div>
          </div>
        </Block>
        <Block id={content} label="Agenda" className={styles.conteudo}>
          {hours ? (
            <AgendaWeek block={content} columns={columns} onOpen={() => actions[0]?.run()} />
          ) : (
            <div className={view === 1 ? styles.mes : styles.lista}>
              {view === 1 &&
                columns.slice(0, 7).map((column) => (
                  <span key={`sem-${column.key}`} className={styles.diaSemana}>
                    {weekdayShort(column.day)}
                  </span>
                ))}
              {columns.map((column, index) => (
                <NavItem
                  key={column.key}
                  block={content}
                  index={index}
                  className={styles.dia}
                  label={shortDate(column.day)}
                  onOpen={() => actions[0]?.run()}
                >
                  <DayCell column={column} list={view === 2} />
                </NavItem>
              ))}
            </div>
          )}
        </Block>
        <Block id={PREVIEW} label="Prévia" className={styles.previa}>
          <AgendaPreview
            block={PREVIEW}
            item={selected}
            dayItems={selectedColumn?.items.slice(1) ?? []}
            actions={actions}
          />
        </Block>
        <Block id={SUBJECTS} title="Matérias">
          <div className={styles.filtro}>
            <FilterGrid label="Matérias">
              {['Todas', ...subjects.map((subject) => subject.code)].map((code, index) => (
                <FilterChip
                  key={code}
                  nav={{ block: SUBJECTS, index }}
                  subject={subjects[index - 1]?.color}
                >
                  {code}
                </FilterChip>
              ))}
            </FilterGrid>
          </div>
        </Block>
        <Block id={COMPLETE} title="A completar" count={String(pending.length)}>
          <div className={styles.completar}>
            {pending.length === 0 && <p className={styles.vazio}>Nada a completar.</p>}
            {pending.map((exam, index) => {
              const subject = subjectOf(data, exam.subjectId);
              return (
                <ListItem
                  key={exam.id}
                  nav={{ block: COMPLETE, index }}
                  title="Prova"
                  detail={`falta ${missingFields(exam).join(' e ')}`}
                  quietSelection
                  onOpen={() => askCompleteExam(data, exam.id)}
                >
                  {subject && <SubjectPill code={subject.code} color={subject.color} />}
                </ListItem>
              );
            })}
          </div>
        </Block>
      </div>
    </ScreenFrame>
  );
}
