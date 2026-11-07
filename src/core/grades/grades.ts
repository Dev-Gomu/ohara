// Regras N1 e N2 de regras.md. Puro: os dados vêm decifrados da tela.
export const BIMESTERS = [1, 2, 3, 4] as const;
export type Bimester = (typeof BIMESTERS)[number];

// Esquema por matéria (e, portanto, por ano): nunca fixo no código (N2).
export interface Scheme {
  subjectId: string;
  min: number;
  // Peso do 1º semestre no ano, em %; o 2º é o que falta para 100.
  semester1: number;
  // Peso do 1º bimestre dentro de cada semestre, em %: [bimestre 1 no 1º semestre, bimestre 3 no 2º].
  bimester1: readonly [number, number];
  // Teto de qualquer nota depois de somar bônus.
  cap: number;
  bonusBimester: readonly [number, number, number, number];
  bonusSemester: readonly [number, number];
}

export interface Item {
  id: string;
  subjectId: string;
  bimester: Bimester;
  name: string;
  weight: number;
  // null: pendente. Não vale zero: fica fora da conta.
  grade: number | null;
  examId: string | null;
  // Item que este repõe: a original sai da conta quando a reposição tem nota.
  replaces: string | null;
  bonus: number;
}

export function defaultScheme(subjectId: string): Scheme {
  return {
    subjectId,
    min: 7,
    semester1: 50,
    bimester1: [50, 50],
    cap: 10,
    bonusBimester: [0, 0, 0, 0],
    bonusSemester: [0, 0],
  };
}

// Copia o esquema de outra matéria (por exemplo, a do ano anterior).
export function copyScheme(from: Scheme, subjectId: string): Scheme {
  return { ...from, subjectId };
}

export interface Result {
  // null: ainda não há nenhuma nota para calcular.
  value: number | null;
  // Há item pendente ou período sem nota: a média ainda pode mudar.
  partial: boolean;
}

const EMPTY: Result = { value: null, partial: true };

function capped(value: number, cap: number): number {
  return Math.min(cap, value);
}

function liveItems(items: readonly Item[]): Item[] {
  const replaced = new Set(
    items
      .filter((item) => item.replaces !== null && item.grade !== null)
      .map((item) => item.replaces),
  );
  return items.filter((item) => !replaced.has(item.id));
}

export function bimesterResult(items: readonly Item[], scheme: Scheme, bimester: Bimester): Result {
  const live = liveItems(items.filter((item) => item.bimester === bimester));
  const graded = live.filter((item) => item.grade !== null);
  const weights = graded.reduce((sum, item) => sum + item.weight, 0);
  const partial = graded.length < live.length;
  if (graded.length === 0 || weights <= 0) return { value: null, partial: true };
  const sum = graded.reduce(
    (total, item) => total + item.weight * capped((item.grade ?? 0) + item.bonus, scheme.cap),
    0,
  );
  const bonus = scheme.bonusBimester[bimester - 1] ?? 0;
  return { value: capped(sum / weights + bonus, scheme.cap), partial };
}

function combine(parts: readonly [Result, number][], bonus: number, cap: number): Result {
  const known = parts.filter(([result]) => result.value !== null);
  const weights = known.reduce((sum, [, weight]) => sum + weight, 0);
  if (known.length === 0 || weights <= 0) return EMPTY;
  const sum = known.reduce((total, [result, weight]) => total + weight * (result.value ?? 0), 0);
  return {
    value: capped(sum / weights + bonus, cap),
    partial: known.length < parts.length || known.some(([result]) => result.partial),
  };
}

export function semesterResult(items: readonly Item[], scheme: Scheme, semester: 1 | 2): Result {
  const first = scheme.bimester1[semester - 1] ?? 50;
  const base = (semester - 1) * 2;
  return combine(
    [
      [bimesterResult(items, scheme, BIMESTERS[base] ?? 1), first],
      [bimesterResult(items, scheme, BIMESTERS[base + 1] ?? 2), 100 - first],
    ],
    scheme.bonusSemester[semester - 1] ?? 0,
    scheme.cap,
  );
}

export function yearResult(items: readonly Item[], scheme: Scheme): Result {
  return combine(
    [
      [semesterResult(items, scheme, 1), scheme.semester1],
      [semesterResult(items, scheme, 2), 100 - scheme.semester1],
    ],
    0,
    scheme.cap,
  );
}

export type Status = 'sem-notas' | 'em-andamento' | 'aprovado' | 'abaixo';

export function statusOf(year: Result, min: number): Status {
  if (year.value === null) return 'sem-notas';
  if (year.partial) return 'em-andamento';
  return year.value >= min ? 'aprovado' : 'abaixo';
}

export type Needed =
  { kind: 'sem-dados' } | { kind: 'precisa'; value: number } | { kind: 'impossivel' };

// Média que falta no 2º semestre: (mínimo × (p1 + p2) − p1 × média1) / p2.
export function neededInSecondSemester(items: readonly Item[], scheme: Scheme): Needed {
  const first = semesterResult(items, scheme, 1).value;
  if (first === null) return { kind: 'sem-dados' };
  const p1 = scheme.semester1;
  const p2 = 100 - p1;
  if (p2 <= 0) return { kind: 'sem-dados' };
  const needed = (scheme.min * (p1 + p2) - p1 * first) / p2;
  if (needed > scheme.cap + 1e-9) return { kind: 'impossivel' };
  return { kind: 'precisa', value: Math.max(0, needed) };
}

export function formatGrade(value: number | null): string {
  return value === null ? '—' : value.toFixed(1).replace('.', ',');
}

export function parseGrade(text: string): number | null | undefined {
  const clean = text.trim().replace(',', '.');
  if (clean === '' || clean === '-') return null;
  const value = Number(clean);
  return Number.isFinite(value) && value >= 0 && value <= 10 ? value : undefined;
}
