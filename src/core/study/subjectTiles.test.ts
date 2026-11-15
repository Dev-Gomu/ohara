import { describe, expect, it } from 'vitest';
import { createFixtures } from './fixtures';
import { capTiles, subjectTiles, TILE_LIMIT } from './subjectTiles';

const today = '2026-11-07';
const data = createFixtures(today);
const many = Array.from({ length: 20 }, (_, index) => ({
  id: `m${index}`,
  code: `M${index}`,
  name: `Matéria ${index}`,
  color: 0,
  due: 0,
}));

describe('grade de disciplinas do treino', () => {
  it('traz todas as disciplinas, de qualquer ano, com vencidos primeiro', () => {
    const tiles = subjectTiles(data, today, '');
    expect(tiles).toHaveLength(data.subjects.length);
    expect(tiles.map((tile) => tile.code)).toContain('ANA');
    const dues = tiles.map((tile) => tile.due);
    expect(dues).toEqual([...dues].sort((a, b) => b - a));
  });

  it('digitar filtra por sigla ou nome, sem acento nem caixa', () => {
    const tiles = subjectTiles(data, today, 'IMUN');
    expect(tiles.map((tile) => tile.code)).toContain('IMU');
    expect(subjectTiles(data, today, 'zzzz')).toEqual([]);
  });

  it('acima do teto, esconde o resto e conta quantas', () => {
    const { shown, hidden } = capTiles(many, []);
    expect(shown).toHaveLength(TILE_LIMIT);
    expect(hidden).toBe(6);
  });

  it('as disciplinas marcadas não somem quando passam do teto', () => {
    const { shown } = capTiles(many, ['m17', 'm19']);
    expect(shown.map((tile) => tile.id)).toEqual(expect.arrayContaining(['m17', 'm19']));
    expect(shown).toHaveLength(TILE_LIMIT);
  });
});
