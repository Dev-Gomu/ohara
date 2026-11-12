import { describe, expect, it } from 'vitest';
import { examsToComplete, hourRange, missingFields, toHours } from './agenda';
import { mondayWeekOf } from './dates';
import { createFixtures } from './fixtures';

describe('semana da Agenda', () => {
  it('converte hora em número', () => {
    expect(toHours('10:15')).toBe(10.25);
  });

  it('alarga a faixa de horas só quando preciso', () => {
    expect(hourRange([{ start: '08:00', end: '12:00' }])).toEqual({ first: 7, last: 19 });
    expect(hourRange([{ start: '06:30', end: '20:10' }])).toEqual({ first: 6, last: 21 });
  });

  it('começa na segunda e termina no domingo', () => {
    expect(mondayWeekOf('2026-11-07')).toEqual([
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
      '2026-11-07',
      '2026-11-08',
    ]);
    expect(mondayWeekOf('2026-11-08')[0]).toBe('2026-11-02');
  });
});

describe('A completar', () => {
  it('lista provas sem data ou hora, sem data primeiro', () => {
    const exams = examsToComplete(createFixtures('2026-11-07'));
    expect(exams.map((exam) => exam.id)).toEqual(['p-sem-data', 'p-sem-hora']);
    expect(exams.map(missingFields)).toEqual([['data', 'hora'], ['hora']]);
  });
});
