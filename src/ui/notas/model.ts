// Contas de tela de Notas: transforma itens e esquema nos números que as peças mostram (D123).
import {
  BIMESTERS,
  bimesterResult,
  bimesterValue,
  itemMax,
  neededInFourthForYear,
  semesterResult,
  toPoints,
  yearResult,
  type Bimester,
  type Item,
  type Scheme,
} from '../../core/grades/grades';
import type { BoletimRowData, NeedCell, TileData } from '../components/Grades';

export function subjectItems(items: readonly Item[], subjectId: string): Item[] {
  return items
    .filter((item) => item.subjectId === subjectId)
    .sort((a, b) => a.bimester - b.bimester || a.name.localeCompare(b.name, 'pt-BR'));
}

export function needCell(items: readonly Item[], scheme: Scheme): NeedCell {
  const fourth = bimesterResult(items, scheme, 4);
  if (fourth.value !== null && !fourth.partial) return null;
  const need = neededInFourthForYear(items, scheme);
  if (need.kind === 'sem-dados') return null;
  if (need.kind === 'impossivel') return 'nao';
  return need.value <= 0.05 ? 'ok' : need.value;
}

export function boletimRow(
  subject: { code: string; color: number },
  items: readonly Item[],
  scheme: Scheme,
): BoletimRowData {
  const semesters = [semesterResult(items, scheme, 1), semesterResult(items, scheme, 2)];
  const year = yearResult(items, scheme);
  return {
    code: subject.code,
    color: subject.color,
    bimesters: BIMESTERS.map((b) => bimesterResult(items, scheme, b).value),
    semesters: semesters.map((r) => r.value),
    semesterOpen: semesters.map((r) => r.value === null || r.partial),
    average: year.value,
    averageOpen: year.value === null || year.partial,
    need: needCell(items, scheme),
    min: scheme.min,
  };
}

export function tileOf(items: readonly Item[], scheme: Scheme, bimester: Bimester): TileData {
  const worth = bimesterValue(scheme, bimester);
  const result = bimesterResult(items, scheme, bimester);
  const mine = items.filter((item) => item.bimester === bimester);
  const sum = mine.reduce((total, item) => total + itemMax(item), 0);
  return {
    name: `${bimester}º bim.`,
    worth,
    points: result.value === null ? null : toPoints(result.value, worth),
    grade10: result.value,
    convert: mine.length > 0 && Math.abs(sum - worth) > 0.01,
    low: result.value !== null && result.value < scheme.min,
  };
}

// Soma dos máximos fora do valor do bimestre: avisa, não bloqueia (D113).
export function sumNote(items: readonly Item[], worth: number): string {
  const sum = items.reduce((total, item) => total + itemMax(item), 0);
  if (items.length === 0 || Math.abs(sum - worth) < 0.01) return '';
  return `as avaliações somam ${sum.toFixed(1)}, o bimestre vale ${worth.toFixed(1)}`;
}
