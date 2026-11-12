// Peças de Notas aprovadas nos degraus 1 a 3 (D121 a D124). Só desenho: as contas vêm da tela.
import type { ReactNode } from 'react';
import { formatGrade } from '../../core/grades/grades';
import { StatePill, SubjectPill } from './Pill';
import { NavItem } from './NavItem';
import styles from './Grades.module.css';

const s = styles as Record<string, string>;
export const cx = (names: string): string =>
  names
    .split(' ')
    .map((name) => s[name] ?? name)
    .join(' ');

export type Nota = number | null;
export const fmt = formatGrade;

export const Of = ({ value }: { value: number }) => <small className={cx('nc-de')}>de {fmt(value)}</small>;
export const Soft = ({ children }: { children: ReactNode }) => (
  <small className={cx('nc-de')}>{children}</small>
);
export const LowMark = () => <i className={cx('np-marca')} />;

// Marca alongada com o sinal dentro (check ou X), sempre com a palavra; nunca círculo.
export function ResultMark({ kind, children }: { kind: 'ok' | 'atencao'; children: string }) {
  return (
    <span className={cx('nd-sinal')} data-tipo={kind}>
      <i>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d={kind === 'ok' ? 'M2.5 6.2 5 8.7 9.5 3.6' : 'M3.2 3.2 8.8 8.8M8.8 3.2 3.2 8.8'} />
        </svg>
      </i>
      {children}
    </span>
  );
}

// Célula C: marca de atenção quando abaixo da meta; total e "em aberto" em pílula de peça.
export function GradeCell(props: {
  value: Nota;
  kind?: 'total' | 'aberto';
  low?: boolean;
}) {
  const { value, kind, low } = props;
  const state = value === null ? 'pendente' : (kind ?? (low ? 'baixa' : 'normal'));
  return (
    <span className={cx('np-cel')} data-v="c" data-estado={state}>
      {state === 'baixa' && <LowMark />}
      {fmt(value)}
    </span>
  );
}

// ---------- Boletim ----------
const Label = ({ children, strong }: { children: string; strong?: boolean }) => (
  <span className={cx('nc-rot')} data-forte={strong ? '' : undefined}>
    {children}
  </span>
);

export function BoletimHeader() {
  return (
    <div className={cx('nc-linha nc-cab')} data-v="c">
      <span />
      {[1, 2].map((n) => (
        <div key={n} className={cx('nc-faixa')}>
          <Label>{`${n * 2 - 1}º bim.`}</Label>
          <Label>{`${n * 2}º bim.`}</Label>
          <Label strong>{`${n}º sem.`}</Label>
        </div>
      ))}
      <Label strong>Média</Label>
      <Label>Precisa no 4º bim.</Label>
    </div>
  );
}

export type NeedCell = number | 'ok' | 'nao' | null;

export function NeedView({ need }: { need: NeedCell }) {
  if (need === null) return <span className={cx('nc-de')}>—</span>;
  if (need === 'ok') return <ResultMark kind="ok">Aprovado</ResultMark>;
  if (need === 'nao') return <ResultMark kind="atencao">Não alcança</ResultMark>;
  return <b className={cx('nc-num')}>{fmt(need)}</b>;
}

export interface BoletimRowData {
  code: string;
  color: number;
  bimesters: readonly Nota[];
  semesters: readonly Nota[];
  semesterOpen: readonly boolean[];
  average: Nota;
  averageOpen: boolean;
  need: NeedCell;
  min: number;
}

export function BoletimRow(props: { row: BoletimRowData; block: string; index: number; onOpen: () => void }) {
  const { row, block, index, onOpen } = props;
  const low = (v: Nota) => v !== null && v < row.min;
  return (
    <NavItem
      block={block}
      index={index}
      className={cx('nc-linha')}
      ring="cursor"
      subject={undefined}
      onOpen={onOpen}
      label={row.code}
    >
      <SubjectPill code={row.code} color={row.color} />
      {[0, 1].map((half) => (
        <div key={half} className={cx('nc-faixa')}>
          {[0, 1].map((k) => {
            const v = row.bimesters[half * 2 + k] ?? null;
            return <GradeCell key={k} value={v} low={low(v)} />;
          })}
          <GradeCell
            value={row.semesterOpen[half] ? null : (row.semesters[half] ?? null)}
            kind="total"
          />
        </div>
      ))}
      <GradeCell value={row.average} kind={row.averageOpen ? 'aberto' : 'total'} />
      <NeedView need={row.need} />
    </NavItem>
  );
}

// ---------- Disciplina ----------
export interface TileData {
  name: string;
  worth: number;
  points: Nota;
  grade10: Nota;
  convert: boolean;
  low: boolean;
}

// Bimestre como seletor: quanto vale e quanto já fez. As avaliações ficam na lista ao lado.
export function BimesterTile(props: { tile: TileData; block: string; index: number }) {
  const { tile, block, index } = props;
  return (
    <NavItem block={block} index={index} className={cx('nt-ficha')} ring="cursor">
      <span className={cx('nc-cartao-topo')}>
        <b>{tile.name}</b>
        <Soft>vale {fmt(tile.worth)}</Soft>
      </span>
      <span className={cx('nc-cartao-num')} data-pendente={tile.points === null ? '' : undefined}>
        {tile.low && <LowMark />}
        <b>{fmt(tile.points)}</b>
        {tile.convert && tile.grade10 !== null && <Soft>nota {fmt(tile.grade10)}</Soft>}
      </span>
    </NavItem>
  );
}

export function SemesterFaixa(props: { label: string; total: Nota; children: ReactNode }) {
  return (
    <div className={cx('nt-sem')}>
      <span className={cx('nt-sem-nome')}>{props.label}</span>
      <div className={cx('nt-sem-fichas')}>
        {props.children}
        <div className={cx('nt-total')}>
          <Soft>Total</Soft>
          <b>{fmt(props.total)}</b>
          <Of value={10} />
        </div>
      </div>
    </div>
  );
}

// Linha de avaliação A: nome à esquerda, "1.6 de 2.0" à direita.
export function AvalRow(props: {
  name: string;
  note: string;
  grade: Nota;
  max: number;
  low: boolean;
  block: string;
  index: number;
  onOpen: () => void;
}) {
  const { name, note, grade, max, low, block, index, onOpen } = props;
  return (
    <NavItem block={block} index={index} className={cx('nc-aval')} ring="cursor" onOpen={onOpen}>
      <span className={cx('nc-aval-nome')}>
        <span>{name}</span>
        {note !== '' && <Soft>{note}</Soft>}
      </span>
      <span className={cx('nc-par')} data-pendente={grade === null ? '' : undefined}>
        {low && <LowMark />}
        <b>{fmt(grade)}</b> <Of value={max} />
      </span>
    </NavItem>
  );
}

export function SummaryLines(props: { lines: readonly [string, ReactNode][]; children?: ReactNode }) {
  return (
    <div className={cx('nc-resumo nc-cartao')} data-v="b">
      {props.lines.map(([label, value]) => (
        <div key={label} className={cx('nc-par-linha')}>
          <span>{label}</span>
          {typeof value === 'string' ? <b>{value}</b> : value}
        </div>
      ))}
      {props.children && <div className={cx('nc-par-linha')}><span />{props.children}</div>}
    </div>
  );
}

export function NeedLines(props: { lines: readonly [string, ReactNode][] }) {
  return (
    <div className={cx('nc-quanto nc-cartao')} data-v="c">
      {props.lines.map(([label, value]) => (
        <div key={label} className={cx('nc-par-linha')}>
          <span>{label}</span>
          {value}
        </div>
      ))}
    </div>
  );
}

export function StatusPill({ kind, children }: { kind: 'ok' | 'atencao'; children: string }) {
  return <StatePill state={kind}>{children}</StatePill>;
}

// Ajuste da meta (ilha A): menos, número e mais. Os dois botões entram no teclado do bloco.
export function GoalIsland(props: { value: number; block: string; onStep: (delta: number) => void }) {
  const { value, block, onStep } = props;
  const step = (index: number, label: string, delta: number, text: string) => (
    <NavItem
      block={block}
      index={index}
      className={cx('np-passo')}
      ring="cursor"
      label={label}
      onOpen={() => onStep(delta)}
    >
      {text}
    </NavItem>
  );
  return (
    <span className={cx('np-meta')} data-v="a">
      <span className={cx('np-meta-nome')}>Meta</span>
      {step(0, 'Diminuir a meta', -0.5, '−')}
      <b>{fmt(value)}</b>
      {step(1, 'Aumentar a meta', 0.5, '+')}
    </span>
  );
}
