import { describe, expect, it } from 'vitest';
import { createFixtures } from './fixtures';
import {
  describeScope,
  emptyScope,
  isEmptyScope,
  lessonGroups,
  parseScope,
  periodChoices,
  pruneScope,
  scopeCards,
  scopeLessons,
  stringifyScope,
  toggleIn,
  toggleSubject,
  yearChoices,
} from './scope';

const today = '2026-11-07';
const data = createFixtures(today);

describe('recorte do treino', () => {
  it('sem marcação não restringe: todos os cartões, de todos os anos', () => {
    expect(isEmptyScope(emptyScope())).toBe(true);
    expect(scopeCards(data, emptyScope())).toHaveLength(data.cards.length);
  });

  it('ano arquivado também treina (D179)', () => {
    const lessons = scopeLessons(data, { ...emptyScope(), years: ['ano-1'] });
    expect(lessons.every((lesson) => lesson.subjectId === 'ana')).toBe(true);
  });

  it('dentro da categoria é "ou"; entre categorias é "e"', () => {
    const two = scopeLessons(data, { ...emptyScope(), subjects: ['imu', 'fis'] });
    expect(new Set(two.map((lesson) => lesson.subjectId))).toEqual(new Set(['imu', 'fis']));
    const both = scopeLessons(data, {
      ...emptyScope(),
      subjects: ['imu'],
      lessons: ['imu-a7', 'fis-a1'],
    });
    expect(both.map((lesson) => lesson.id)).toEqual(['imu-a7']);
  });

  it('bimestre junta as matérias pelo nome', () => {
    const lessons = scopeLessons(data, { ...emptyScope(), periods: ['2º bimestre'] });
    expect(lessons.length).toBeGreaterThan(0);
    expect(new Set(lessons.map((lesson) => lesson.subjectId)).size).toBeGreaterThan(1);
  });

  it('anos e bimestres oferecidos têm cartões', () => {
    expect(yearChoices(data, today).every((choice) => choice.total > 0)).toBe(true);
    expect(periodChoices(data, today).map((choice) => choice.label)).toContain('1º bimestre');
  });

  it('marcar e desmarcar soma e tira da lista', () => {
    expect(toggleIn(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleIn(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('desmarcar a disciplina desmarca as aulas dela', () => {
    const scope = { ...emptyScope(), subjects: ['imu', 'fis'], lessons: ['imu-a7', 'fis-a1'] };
    const next = toggleSubject(data, scope, 'imu');
    expect(next.subjects).toEqual(['fis']);
    expect(next.lessons).toEqual(['fis-a1']);
    expect(toggleSubject(data, next, 'imu').subjects).toEqual(['fis', 'imu']);
  });

  it('as aulas aparecem por disciplina marcada e bimestre, só com cartões', () => {
    expect(lessonGroups(data, emptyScope(), today)).toEqual([]);
    const groups = lessonGroups(data, { ...emptyScope(), subjects: ['imu'] }, today);
    expect(groups.length).toBeGreaterThan(0);
    expect(groups.every((group) => group.subjectId === 'imu')).toBe(true);
    expect(groups.flatMap((group) => group.rows).every((row) => row.total > 0)).toBe(true);
    const only = lessonGroups(
      data,
      { ...emptyScope(), subjects: ['imu'], periods: ['2º bimestre'] },
      today,
    );
    expect(only.every((group) => group.label === '2º bimestre')).toBe(true);
  });

  it('descreve o recorte para o nome do arquivo', () => {
    expect(describeScope(data, emptyScope())).toBe('Todos os cartões');
    const scope = { ...emptyScope(), years: ['ano-1'], subjects: ['ana'], lessons: ['x'] };
    expect(describeScope(data, scope)).toBe('1º ano · ANA · 1 aula');
  });

  it('lembra os filtros e ignora texto estragado', () => {
    const scope = { ...emptyScope(), subjects: ['imu'] };
    expect(parseScope(stringifyScope(scope))).toEqual(scope);
    expect(parseScope('lixo')).toEqual(emptyScope());
    expect(parseScope(undefined)).toEqual(emptyScope());
  });

  it('tira do recorte o que não existe mais', () => {
    const scope = { ...emptyScope(), subjects: ['imu', 'sumiu'], lessons: ['nada'] };
    expect(pruneScope(data, scope)).toEqual({ ...emptyScope(), subjects: ['imu'] });
  });
});
