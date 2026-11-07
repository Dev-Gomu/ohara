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
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { Ruler } from '../../components/Ruler';
import { dispatch } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { AGENDA_MONTH, AGENDA_DAY, AGENDA_VIEWS } from '../../study/navigation';
import { useScreenMemory } from '../../study/screenMemory';
import { nowTime, today, useStudy } from '../../study/study';
import styles from './Agenda.module.css';
import { gradeColumns, weekColumns, type AgendaColumn } from './agendaData';
import { agendaOptions, askCompleteExam } from './agendaForms';
import { AgendaPreview, previewActions } from './AgendaPreview';
import { AgendaWeek } from './AgendaWeek';

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
      <span className={styles.cabeca} data-hoje={column.day === today}>
        {list ? shortDate(column.day) : `${weekdayShort(column.day)} ${column.number}`}
      </span>
      {column.items.slice(1).map((item) => (
        <span
          key={item.id}
          className={styles.evento}
          data-materia={item.subject?.color ?? 7}
          data-prova={item.kind === 'prova'}
        >
          {item.start} {item.kind === 'prova' ? 'Prova ' : ''}
          {item.subject?.code ?? item.title}
        </span>
      ))}
    </>
  );
}

export function Agenda() {
  const data = useStudy();
  const [shown, setShown] = useScreenMemory(AGENDA_DAY, today);
  const view = useSelectedIndex(AGENDA_VIEWS, 4);
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
  const views = [
    { id: 'semana', title: 'Semana', detail: 'dias e horas' },
    { id: 'mes', title: 'Mês', detail: monthName(view === 1 ? anchor : today) },
    { id: 'lista', title: 'Lista', detail: `${LIST_DAYS} dias` },
    { id: 'grade', title: 'Grade', detail: 'horário fixo' },
  ];
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
              <button type="button" aria-label="Anterior" onClick={() => changePage(-1)}>
                ‹
              </button>
              <button type="button" onClick={() => setShown(today)}>
                Hoje
              </button>
              <button type="button" aria-label="Próximo" onClick={() => changePage(1)}>
                ›
              </button>
              <span className={styles.datas}>{period}</span>
              <kbd className={styles.tecla}>Alt PgUp PgDn</kbd>
              <button
                type="button"
                className={styles.novo}
                onClick={() => dispatch({ type: 'openOptions' })}
              >
                + Novo <kbd>Alt N</kbd>
              </button>
            </div>
          </div>
        </Block>
        <Block id={content} label="Agenda" className={styles.conteudo}>
          {hours ? (
            <AgendaWeek block={content} columns={columns} onOpen={() => actions[0]?.run()} />
          ) : (
            <div className={view === 1 ? styles.mes : styles.lista}>
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
            {['Todas', ...subjects.map((subject) => subject.code)].map((code, index) => (
              <span key={code} className={styles.lugar} data-materia={subjects[index - 1]?.color}>
                <NavItem
                  block={SUBJECTS}
                  index={index}
                  ring="anel"
                  className={styles.filtroItem}
                  color={index === 0 ? 'todas' : 'materia'}
                >
                  {code}
                </NavItem>
              </span>
            ))}
          </div>
        </Block>
        <Block id={COMPLETE} title="A completar" count={String(pending.length)}>
          <div className={styles.completar}>
            {pending.length === 0 && <p className={styles.vazio}>Nada a completar.</p>}
            {pending.map((exam, index) => {
              const subject = subjectOf(data, exam.subjectId);
              return (
                <NavItem
                  key={exam.id}
                  block={COMPLETE}
                  index={index}
                  className={styles.item}
                  onOpen={() => askCompleteExam(data, exam.id)}
                >
                  <span className={styles.sigla} data-materia={subject?.color}>
                    {subject?.code}
                  </span>
                  <b className={styles.titulo}>Prova</b>
                  <span className={styles.falta}>falta {missingFields(exam).join(' e ')}</span>
                </NavItem>
              );
            })}
          </div>
        </Block>
      </div>
    </ScreenFrame>
  );
}
