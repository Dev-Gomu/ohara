import type { Direction } from './actions';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Abaixo disso o outro bloco conta como alinhado, não como estando naquele lado.
const MIN_DISTANCE = 2;

// O vizinho é o mais próximo no lado pedido; estar alinhado pesa mais do que estar perto.
export function neighbor(
  rects: Readonly<Record<string, Rect>>,
  from: string,
  direction: Direction,
): string | null {
  const origin = rects[from];
  if (!origin) return null;
  const horizontal = direction === 'left' || direction === 'right';
  const sign = direction === 'right' || direction === 'down' ? 1 : -1;
  const originX = origin.x + origin.w / 2;
  const originY = origin.y + origin.h / 2;
  let best: string | null = null;
  let bestScore = Infinity;
  for (const [id, rect] of Object.entries(rects)) {
    if (id === from) continue;
    const dx = rect.x + rect.w / 2 - originX;
    const dy = rect.y + rect.h / 2 - originY;
    const main = (horizontal ? dx : dy) * sign;
    if (main < MIN_DISTANCE) continue;
    const score = main + Math.abs(horizontal ? dy : dx) * 0.5;
    if (score < bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}
