import type { Direction } from './actions';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Folga para vãos e arredondamento: tocar a borda ainda conta como estar daquele lado.
const TOLERANCE = 2;

function gapTo(origin: Rect, rect: Rect, direction: Direction): number {
  if (direction === 'right') return rect.x - (origin.x + origin.w);
  if (direction === 'left') return origin.x - (rect.x + rect.w);
  if (direction === 'down') return rect.y - (origin.y + origin.h);
  return origin.y - (rect.y + rect.h);
}

function overlap(origin: Rect, rect: Rect, direction: Direction): number {
  const horizontal = direction === 'left' || direction === 'right';
  const [a, b, c, d] = horizontal
    ? [origin.y, origin.y + origin.h, rect.y, rect.y + rect.h]
    : [origin.x, origin.x + origin.w, rect.x, rect.x + rect.w];
  return Math.min(b, d) - Math.max(a, c);
}

// O vizinho é quem encosta naquele lado e divide mais borda com o bloco. Comparar só centros
// erra quando um bloco alto fica ao lado de dois baixos.
export function neighbor(
  rects: Readonly<Record<string, Rect>>,
  from: string,
  direction: Direction,
): string | null {
  const origin = rects[from];
  if (!origin) return null;
  let best: string | null = null;
  let bestGap = Infinity;
  let bestOverlap = -Infinity;
  for (const [id, rect] of Object.entries(rects)) {
    if (id === from) continue;
    const gap = gapTo(origin, rect, direction);
    const shared = overlap(origin, rect, direction);
    if (gap < -TOLERANCE || shared <= 0) continue;
    const closer = gap < bestGap - TOLERANCE;
    const sameRow = Math.abs(gap - bestGap) <= TOLERANCE;
    if (closer || (sameRow && shared > bestOverlap)) {
      best = id;
      bestGap = gap;
      bestOverlap = shared;
    }
  }
  return best;
}
