// Tamanho das células de uma tabela (D149). Largura é por coluna; altura é só mínima, por linha.
export const SIZE_STEP = 8;
export const SIZE_BIG_STEP = 24;
export const MIN_WIDTH = 60;
export const MIN_HEIGHT = 28;

export type SizeAxis = 'width' | 'height';

export const stepFor = (big: boolean): number => (big ? SIZE_BIG_STEP : SIZE_STEP);

export function clampSize(axis: SizeAxis, value: number): number {
  return Math.max(axis === 'width' ? MIN_WIDTH : MIN_HEIGHT, Math.round(value));
}

// Muda só a coluna `index`; as outras mantêm a largura medida (assim a tabela não se refaz sozinha).
export function resizeColumn(widths: readonly number[], index: number, target: number): number[] {
  return widths.map((width, i) => (i === index ? clampSize('width', target) : Math.round(width)));
}
