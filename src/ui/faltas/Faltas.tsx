import {
  cancelDay,
  markOccurrence,
  reopenDay,
  pastOccurrences,
  presenceOf,
  setClassesFrom,
  situationOf,
  type Occurrence,
  type Presence,
  type PresenceStatus,
  type Situation,
} from '../../core/study/attendance';
import { isoDay, shortDate } from '../../core/study/dates';
import type { StudyData, Subject } from '../../core/study/types';
import { Block } from '../components/Block';
import { NavItem, useSelectedIndex } from '../components/NavItem';
import { getKeyboardState, type BlockOption } from '../keyboard/store';
import { useBlocks } from '../keyboard/useBlocks';
import styles from '../notas/Notas.module.css';
import { ask } from '../shell/PromptWindow';
import { ScreenFrame } from '../shell/ScreenFrame';
import { closeFaults } from '../study/navigation';
import { showNotice } from '../study/notice';
import { storage, useStudy } from '../study/study';

const SUBJECTS = 'faltas.materias';
const CLASSES = 'faltas.aulas';
const SUMMARY = 'faltas.resumo';

const STATUS: Record<PresenceStatus, string> = {
  'sem-aulas': 'sem aulas ainda',
  ok: 'dentro do limite',
  limite: 'no limite: não pode faltar mais',
  abaixo: 'abaixo de 75%',
};

function hours(value: number): string {
  return `${String(value)} h`;
}

function percent(value: number | null): string {
  return value === null ? '—' : `${(value * 100).toFixed(1)}%`;
}

function subjectsOf(data: StudyData): Subject[] {
  const years = new Set(data.years.filter((year) => !year.archived).map((year) => year.id));
  return data.subjects.filter((subject) => years.has(subject.yearId));
}

function occurrencesOf(data: StudyData, subject: Subject | undefined): Occurrence[] {
  if (!subject?.classesFrom) return [];
  const now = new Date();
  return pastOccurrences(
    data,
    subject.id,
    subject.classesFrom,
    isoDay(now),
    now.toTimeString().slice(0, 5),
  );
}

function describe(item: Occurrence): string {
  const situation = situationOf(item);
  if (situation.kind === 'cancelada') return 'aula cancelada';
  if (situation.kind === 'falta') return `faltei ${hours(situation.hours)}`;
  return 'presente';
}

const NO_HOURS = 'Horas faltadas (só vale em falta parcial)';

function askSituation(item: Occurrence): void {
  const current = situationOf(item);
  ask({
    title: `Aula de ${shortDate(item.date)}, ${item.start} (${hours(item.blocks)})`,
    action: 'Salvar',
    fields: [
      {
        id: 'situacao',
        label: 'Situação',
        value:
          current.kind === 'falta'
            ? current.hours >= item.blocks
              ? 'falta'
              : 'parcial'
            : current.kind,
        options: [
          { value: 'presente', label: 'Presente' },
          { value: 'falta', label: `Faltei (${hours(item.blocks)})` },
          { value: 'parcial', label: 'Faltei só algumas horas' },
          { value: 'cancelada', label: 'Aula cancelada (feriado, professor ausente)' },
        ],
      },
      {
        id: 'horas',
        label: NO_HOURS,
        value: current.kind === 'falta' ? String(current.hours) : '1',
      },
    ],
    onSubmit: ({ situacao = 'presente', horas = '1' }) => {
      let next: Situation = { kind: 'presente' };
      if (situacao === 'falta') next = { kind: 'falta', hours: item.blocks };
      if (situacao === 'cancelada') next = { kind: 'cancelada' };
      if (situacao === 'parcial') {
        const value = Number(horas.replace(',', '.'));
        if (!Number.isFinite(value) || value <= 0) return showNotice('Informe as horas faltadas.');
        next = { kind: 'falta', hours: Math.min(value, item.blocks) };
      }
      storage.write((data) => markOccurrence(data, item, next, crypto.randomUUID()));
    },
  });
}

function askHoliday(): void {
  ask({
    title: 'Feriado ou dia sem aula',
    action: 'Aplicar',
    fields: [
      { id: 'data', label: 'Dia', type: 'date', value: isoDay(new Date()) },
      {
        id: 'acao',
        label: 'O que fazer',
        value: 'cancelar',
        options: [
          { value: 'cancelar', label: 'Cancelar todas as aulas do dia (nenhuma matéria conta)' },
          { value: 'reabrir', label: 'Desfazer: as aulas canceladas do dia voltam a contar' },
        ],
      },
    ],
    onSubmit: ({ data = '', acao = 'cancelar' }) => {
      storage.write((all) =>
        acao === 'reabrir' ? reopenDay(all, data) : cancelDay(all, data, () => crypto.randomUUID()),
      );
      showNotice(
        acao === 'reabrir' ? 'Aulas do dia voltaram a contar.' : 'Aulas do dia canceladas.',
      );
    },
  });
}

function askStart(subject: Subject): void {
  ask({
    title: `Início das aulas de ${subject.code}`,
    action: 'Salvar',
    fields: [
      {
        id: 'data',
        label: 'Primeira aula que conta para a presença',
        type: 'date',
        value: subject.classesFrom ?? isoDay(new Date()),
      },
    ],
    onSubmit: ({ data = '' }) => storage.write((all) => setClassesFrom(all, subject.id, data)),
  });
}

function Summary({ presence, subject }: { presence: Presence; subject: Subject }) {
  const over = presence.status === 'abaixo';
  return (
    <div className={styles.corpo}>
      <dl className={styles.quadro}>
        <dt>Presença</dt>
        <dd>
          <b>{percent(presence.percent)}</b>
        </dd>
        <dt>Aulas dadas</dt>
        <dd>{hours(presence.total)}</dd>
        <dt>Faltas</dt>
        <dd>{hours(presence.missed)}</dd>
        <dt>Canceladas (fora da conta)</dt>
        <dd>{hours(presence.cancelled)}</dd>
        <dt>Início da contagem</dt>
        <dd>{subject.classesFrom ? shortDate(subject.classesFrom) : '—'}</dd>
      </dl>
      <p className={styles.destaque}>{STATUS[presence.status]}</p>
      {presence.status !== 'sem-aulas' && (
        <p className={styles.texto}>
          {over
            ? `Passou ${hours(Math.abs(presence.margin))} do limite de faltas.`
            : `Ainda pode faltar ${hours(Math.max(0, presence.margin))} sem cair de 75%.`}
        </p>
      )}
    </div>
  );
}

export function Faltas() {
  const data = useStudy();
  const subjects = subjectsOf(data);
  const subject = subjects[useSelectedIndex(SUBJECTS, subjects.length)];
  const all = occurrencesOf(data, subject);
  const list = [...all].reverse();
  const item = list[useSelectedIndex(CLASSES, list.length)];
  const inClasses = () => getKeyboardState().focus.block === CLASSES;

  const options = (): BlockOption[] => {
    if (!subject) return [];
    return [
      {
        id: 'inicio',
        label: 'Definir o início das aulas',
        keys: 'Alt N',
        run: () => askStart(subject),
      },
      { id: 'feriado', label: 'Feriado ou dia sem aula', run: askHoliday },
      ...(item && inClasses()
        ? [{ id: 'marcar', label: 'Marcar esta aula', run: () => askSituation(item) }]
        : []),
    ];
  };

  useBlocks({
    blocks: [
      {
        id: SUBJECTS,
        kind: 'nav',
        nav: { axis: 'y', count: subjects.length },
        neighbors: { right: CLASSES },
        resets: [CLASSES],
        enterGoesTo: CLASSES,
      },
      {
        id: CLASSES,
        kind: 'nav',
        nav: { axis: 'y', count: list.length },
        neighbors: { left: SUBJECTS, right: SUMMARY },
        onActivate: () => item && askSituation(item),
      },
      { id: SUMMARY, kind: 'none', neighbors: { left: CLASSES } },
    ],
    arrival: { block: SUBJECTS, level: 'nav', items: { [SUBJECTS]: 0 } },
    back: closeFaults,
    options,
    actions: {
      newItem: () => {
        if (subject) askStart(subject);
      },
    },
  });

  return (
    <ScreenFrame
      title="Faltas"
      caps={false}
      end={
        <button type="button" className={styles.voltar} onClick={closeFaults}>
          ← Agenda <kbd>Esc</kbd>
        </button>
      }
    >
      <div className={styles.notas}>
        <Block id={SUBJECTS} title="Matérias" className={styles.materias}>
          <div className={styles.corpo}>
            {subjects.length === 0 && <p className={styles.texto}>Crie uma matéria no Acervo.</p>}
            {subjects.map((entry, index) => {
              const presence = presenceOf(occurrencesOf(data, entry));
              return (
                <NavItem
                  key={entry.id}
                  block={SUBJECTS}
                  index={index}
                  className={`${styles.linha} ${styles.materia}`}
                  ring="anel-interno"
                >
                  <b>{entry.code}</b>
                  <span>{entry.name}</span>
                  <span className={styles.nota} data-status={presence.status}>
                    {percent(presence.percent)}
                  </span>
                </NavItem>
              );
            })}
          </div>
        </Block>
        <Block
          id={CLASSES}
          title={subject ? `Aulas de ${subject.code}` : 'Aulas'}
          className={styles.itens}
          shortcut="Alt N"
          menu
        >
          <div className={styles.corpo}>
            {subject && !subject.classesFrom && (
              <p className={styles.texto}>
                Diga quando as aulas desta matéria começaram: Alt N. Só as aulas da Grade e da
                Agenda daí em diante entram na conta.
              </p>
            )}
            {subject?.classesFrom && list.length === 0 && (
              <p className={styles.texto}>
                Ainda não houve aula da Grade ou da Agenda nesse período.
              </p>
            )}
            {list.map((entry, index) => (
              <NavItem
                key={`${entry.date}-${entry.start}`}
                block={CLASSES}
                index={index}
                className={styles.linha}
                ring="anel-interno"
                onOpen={() => askSituation(entry)}
              >
                <span className={styles.detalhe}>{hours(entry.blocks)}</span>
                <span>
                  {shortDate(entry.date)} · {entry.start}–{entry.end}
                </span>
                <span className={styles.nota}>{describe(entry)}</span>
                <span />
              </NavItem>
            ))}
          </div>
        </Block>
        <Block id={SUMMARY} title="Resumo" className={styles.resumo}>
          {subject && <Summary presence={presenceOf(all)} subject={subject} />}
        </Block>
      </div>
    </ScreenFrame>
  );
}
