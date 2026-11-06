import { describe, expect, it } from 'vitest';
import { neighbor, type Rect } from './neighbor';

const rects: Record<string, Rect> = {
  left: { x: 0, y: 0, w: 200, h: 200 },
  top: { x: 200, y: 0, w: 200, h: 100 },
  bottom: { x: 200, y: 100, w: 200, h: 100 },
};

describe('neighbor', () => {
  it('acha o vizinho nas quatro direções', () => {
    expect(neighbor(rects, 'top', 'left')).toBe('left');
    expect(neighbor(rects, 'top', 'down')).toBe('bottom');
    expect(neighbor(rects, 'bottom', 'up')).toBe('top');
    expect(neighbor(rects, 'left', 'right')).toBe('top');
  });

  it('devolve nulo sem vizinho naquele lado', () => {
    expect(neighbor(rects, 'left', 'left')).toBeNull();
    expect(neighbor(rects, 'top', 'up')).toBeNull();
    expect(neighbor(rects, 'bottom', 'down')).toBeNull();
  });

  it('devolve nulo se o bloco de origem não existe', () => {
    expect(neighbor(rects, 'nenhum', 'left')).toBeNull();
  });

  it('prefere o alinhado ao que está mais perto em diagonal', () => {
    const row: Record<string, Rect> = {
      from: { x: 0, y: 0, w: 10, h: 10 },
      diagonal: { x: 20, y: 100, w: 10, h: 10 },
      aligned: { x: 60, y: 0, w: 10, h: 10 },
    };
    expect(neighbor(row, 'from', 'right')).toBe('aligned');
  });

  // Limite herdado do protótipo: só os centros contam. Ver o backlog antes da Etapa 4.
  it('com blocos mais altos que largos, o bloco alto ao lado empata com o de baixo', () => {
    const narrow: Record<string, Rect> = {
      left: { x: 0, y: 0, w: 100, h: 200 },
      top: { x: 100, y: 0, w: 100, h: 100 },
      bottom: { x: 100, y: 100, w: 100, h: 100 },
    };
    expect(neighbor(narrow, 'top', 'down')).toBe('left');
  });

  it('ignora quem está alinhado no eixo pedido', () => {
    const stacked: Record<string, Rect> = {
      from: { x: 0, y: 0, w: 10, h: 10 },
      below: { x: 1, y: 50, w: 10, h: 10 },
    };
    expect(neighbor(stacked, 'from', 'right')).toBeNull();
  });
});
