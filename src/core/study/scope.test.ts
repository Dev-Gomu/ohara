import { describe, expect, it } from 'vitest';
import { createFixtures } from './fixtures';
import {
  describeScope,
  EVERYTHING,
  fullScope,
  scopeCards,
  scopeLessons,
  scopeRows,
  togglePick,
} from './scope';

const today = '2026-11-07';
const data = createFixtures(today);
const imu = fullScope('imu');

describe('escolha do treino', () => {
  it('sem matéria, junta os bimestres de todas pelo nome', () => {
    const rows = scopeRows(data, fullScope(null), today);
    expect(rows.map((row) => row.label)).toEqual([
      'Todos os cartões',
      '1º bimestre',
      '2º bimestre',
      'Sem bimestre',
    ]);
    expect(rows.filter((row) => row.checked).map((row) => row.label)).toEqual(['Todos os cartões']);
  });

  it('todos os cartões cobrem o baralho inteiro', () => {
    expect(scopeCards(data, fullScope(null))).toHaveLength(data.cards.length);
  });

  it('com matéria, mostra as aulas abaixo de cada pasta', () => {
    const rows = scopeRows(data, imu, today);
    expect(rows[1]).toMatchObject({ kind: 'folder', label: '1º bimestre' });
    expect(rows[2]).toMatchObject({ kind: 'lesson', label: 'Células do sistema imune' });
  });

  it('com tudo ativo, marcar uma linha escolhe só ela', () => {
    expect(togglePick(data, imu, 'imu-b1').picks).toEqual(['imu-b1']);
    expect(togglePick(data, imu, 'imu-a7').picks).toEqual(['imu-a7']);
  });

  it('marcar outra linha soma à escolha', () => {
    const next = togglePick(data, { subjectId: 'imu', picks: ['imu-b1'] }, 'imu-a7');
    expect(next.picks).toEqual(['imu-b1', 'imu-a7']);
  });

  it('marcar uma pasta absorve as aulas dela já marcadas', () => {
    const one = togglePick(data, { subjectId: 'imu', picks: ['imu-a4'] }, 'imu-b2');
    expect(one.picks).toEqual(['imu-b2']);
  });

  it('desmarcar uma aula de pasta marcada troca a pasta pelas outras aulas', () => {
    const next = togglePick(data, { subjectId: 'imu', picks: ['imu-b1'] }, 'imu-a1');
    expect(next.picks).toEqual(['imu-a2', 'imu-a3']);
  });

  it('uma aula sozinha treina só os cartões dela', () => {
    const scope = { subjectId: 'imu', picks: ['imu-a7'] };
    expect(scopeLessons(data, scope).map((lesson) => lesson.id)).toEqual(['imu-a7']);
  });

  it('a escolha nunca fica vazia', () => {
    const next = togglePick(data, { subjectId: 'imu', picks: ['imu-a7'] }, 'imu-a7');
    expect(next.picks).toEqual([EVERYTHING]);
  });

  it('descreve a escolha em uma frase', () => {
    const scope = { subjectId: 'imu', picks: ['imu-b2', 'imu-a1'] };
    expect(describeScope(data, scope)).toBe('Imunologia · 2º bimestre e 1 aula');
    expect(describeScope(data, fullScope(null))).toBe('Todas as matérias');
  });
});
