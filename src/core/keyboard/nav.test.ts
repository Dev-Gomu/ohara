import { describe, expect, it } from 'vitest';
import { stepNav } from './nav';

describe('régua (D71)', () => {
  const ruler = { axis: 'x', count: 3 } as const;

  it('anda no próprio eixo', () => {
    expect(stepNav(ruler, 0, 'right')).toBe(1);
    expect(stepNav(ruler, 2, 'left')).toBe(1);
  });

  it('sai pela seta do outro eixo', () => {
    expect(stepNav(ruler, 1, 'down')).toBe('exit');
    expect(stepNav(ruler, 1, 'up')).toBe('exit');
  });

  it('sai pela borda, sem dar a volta', () => {
    expect(stepNav(ruler, 2, 'right')).toBe('exit');
    expect(stepNav(ruler, 0, 'left')).toBe('exit');
  });
});

describe('lista (D71)', () => {
  const list = { axis: 'y', count: 3 } as const;

  it('anda no próprio eixo e sai pelo outro', () => {
    expect(stepNav(list, 0, 'down')).toBe(1);
    expect(stepNav(list, 1, 'right')).toBe('exit');
  });

  it('sai pela borda de cima', () => {
    expect(stepNav(list, 0, 'up')).toBe('exit');
  });

  it('vazia, qualquer seta sai', () => {
    expect(stepNav({ axis: 'y', count: 0 }, 0, 'down')).toBe('exit');
  });
});

describe('grade (D71)', () => {
  // 0 1 2
  // 3 4
  const grid = { axis: 'grid', count: 5, columns: 3 } as const;

  it('usa os dois eixos', () => {
    expect(stepNav(grid, 0, 'right')).toBe(1);
    expect(stepNav(grid, 1, 'down')).toBe(4);
    expect(stepNav(grid, 4, 'up')).toBe(1);
    expect(stepNav(grid, 4, 'left')).toBe(3);
  });

  it('sai pelas bordas', () => {
    expect(stepNav(grid, 0, 'left')).toBe('exit');
    expect(stepNav(grid, 2, 'right')).toBe('exit');
    expect(stepNav(grid, 1, 'up')).toBe('exit');
    expect(stepNav(grid, 3, 'down')).toBe('exit');
    expect(stepNav(grid, 4, 'right')).toBe('exit');
  });

  it('desce para o último item quando a linha de baixo é incompleta', () => {
    expect(stepNav(grid, 2, 'down')).toBe(4);
  });
});

describe('colunas da semana', () => {
  const week = { axis: 'columns', count: 7, lengths: [3, 0, 1, 3] } as const;

  it('anda dentro do dia e sai pelas bordas de cima e de baixo', () => {
    expect(stepNav(week, 0, 'down')).toBe(1);
    expect(stepNav(week, 2, 'down')).toBe('exit');
    expect(stepNav(week, 0, 'up')).toBe('exit');
  });

  it('pula dia vazio e mantém a linha quando cabe', () => {
    expect(stepNav(week, 0, 'right')).toBe(3);
    expect(stepNav(week, 3, 'right')).toBe(4);
    expect(stepNav(week, 6, 'left')).toBe(3);
    expect(stepNav(week, 2, 'right')).toBe(3);
  });

  it('sai pelas laterais sem dar a volta', () => {
    expect(stepNav(week, 1, 'left')).toBe('exit');
    expect(stepNav(week, 5, 'right')).toBe('exit');
  });
});
