import type { Direction } from './actions';

// 'columns': colunas de tamanhos diferentes, como os dias da semana na Agenda.
export type Axis = 'x' | 'y' | 'grid' | 'columns';

export interface NavShape {
  axis: Axis;
  count: number;
  columns?: number;
  lengths?: readonly number[];
}

function stepLine(index: number, count: number, step: number): number | 'exit' {
  const next = index + step;
  return next < 0 || next >= count ? 'exit' : next;
}

function stepGrid(index: number, count: number, columns: number, direction: Direction) {
  const column = index % columns;
  if (direction === 'left') return column === 0 ? 'exit' : index - 1;
  if (direction === 'right') {
    return column === columns - 1 || index + 1 >= count ? 'exit' : index + 1;
  }
  if (direction === 'up') return index < columns ? 'exit' : index - columns;
  const below = index + columns;
  if (below < count) return below;
  // Linha de baixo incompleta: desce para o último item em vez de sair da grade.
  const lastRow = Math.floor((count - 1) / columns);
  return Math.floor(index / columns) < lastRow ? count - 1 : 'exit';
}

function stepColumns(index: number, lengths: readonly number[], direction: Direction) {
  let column = 0;
  let start = 0;
  while (column < lengths.length - 1 && index >= start + (lengths[column] ?? 0)) {
    start += lengths[column] ?? 0;
    column += 1;
  }
  const row = index - start;
  const length = lengths[column] ?? 0;
  if (direction === 'up') return row === 0 ? 'exit' : index - 1;
  if (direction === 'down') return row >= length - 1 ? 'exit' : index + 1;
  const step = direction === 'left' ? -1 : 1;
  let target = column + step;
  while ((lengths[target] ?? -1) === 0) target += step;
  const size = lengths[target];
  if (size === undefined) return 'exit';
  const offset = lengths.slice(0, target).reduce((sum, value) => sum + value, 0);
  return offset + Math.min(row, size - 1);
}

// D71: cada controle usa o seu eixo; a seta do outro eixo e a seta na borda saem do controle.
export function stepNav(shape: NavShape, index: number, direction: Direction): number | 'exit' {
  const { axis, count } = shape;
  if (count === 0) return 'exit';
  if (axis === 'columns') return stepColumns(index, shape.lengths ?? [count], direction);
  if (axis === 'grid') return stepGrid(index, count, shape.columns ?? 1, direction);
  const horizontal = direction === 'left' || direction === 'right';
  if (horizontal !== (axis === 'x')) return 'exit';
  return stepLine(index, count, direction === 'right' || direction === 'down' ? 1 : -1);
}
