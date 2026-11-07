import { describe, expect, it } from 'vitest';
import {
  blocksOf,
  markOccurrence,
  pastOccurrences,
  presenceOf,
  situationOf,
  type Occurrence,
} from './attendance';
import { EMPTY_STUDY } from './create';
import type { Slot, StudyData } from './types';

// 2026-11-02 é segunda-feira.
const slot = (id: string, start: string, end: string, weekday = 1): Slot => ({
  id,
  subjectId: 'imu',
  weekday,
  start,
  end,
  every: 1,
  anchor: '2026-11-02',
  label: 'T',
  room: '',
});

function dataWith(slots: Slot[]): StudyData {
  return { ...EMPTY_STUDY, slots };
}

function occ(blocks: number, record?: Occurrence['record']): Occurrence {
  return { subjectId: 'imu', date: '2026-11-02', start: '08:00', end: '09:00', blocks, record };
}

describe('blocos de 1 hora', () => {
  it('conta blocos pela duração, no mínimo 1', () => {
    expect(blocksOf('08:00', '09:00')).toBe(1);
    expect(blocksOf('08:00', '10:00')).toBe(2);
    expect(blocksOf('08:00', '08:50')).toBe(1);
    expect(blocksOf('08:00', '11:00')).toBe(3);
  });
});

describe('aulas que já aconteceram', () => {
  const data = dataWith([slot('s1', '08:00', '10:00'), slot('s2', '13:00', '14:00')]);

  it('lista as segundas desde o início até hoje, sem as que ainda não terminaram', () => {
    const list = pastOccurrences(data, 'imu', '2026-11-02', '2026-11-09', '09:00');
    expect(list.map((item) => `${item.date} ${item.start}`)).toEqual([
      '2026-11-02 08:00',
      '2026-11-02 13:00',
    ]);
  });

  it('a aula de hoje só entra depois que termina', () => {
    const early = pastOccurrences(data, 'imu', '2026-11-09', '2026-11-09', '09:59');
    const late = pastOccurrences(data, 'imu', '2026-11-09', '2026-11-09', '10:00');
    expect(early).toHaveLength(0);
    expect(late.map((item) => item.blocks)).toEqual([2]);
  });

  it('ignora outras matérias e outros tipos de evento', () => {
    expect(pastOccurrences(data, 'outra', '2026-11-02', '2026-11-09', '23:00')).toEqual([]);
  });
});

describe('presença de 75%', () => {
  it('12 blocos na semana: pode faltar 3 e ainda ter 75%', () => {
    const ok = presenceOf([
      occ(12, { id: 'a', subjectId: 'imu', date: '', start: '', missed: 3, cancelled: false }),
    ]);
    expect(ok.percent).toBe(0.75);
    expect(ok.status).toBe('limite');
    expect(ok.margin).toBe(0);
    const over = presenceOf([
      occ(12, { id: 'a', subjectId: 'imu', date: '', start: '', missed: 3.5, cancelled: false }),
    ]);
    expect(over.status).toBe('abaixo');
  });

  it('mostra a margem de faltas que ainda cabe', () => {
    const items = Array.from({ length: 12 }, () => occ(1));
    const result = presenceOf(items);
    expect(result.total).toBe(12);
    expect(result.margin).toBe(3);
    expect(result.status).toBe('ok');
  });

  it('aula cancelada sai da conta, e feriado não gera falta', () => {
    const cancelled = {
      id: 'c',
      subjectId: 'imu',
      date: '',
      start: '',
      missed: 0,
      cancelled: true,
    };
    const result = presenceOf([occ(2, cancelled), occ(2), occ(2), occ(2), occ(2)]);
    expect(result.total).toBe(8);
    expect(result.cancelled).toBe(2);
    expect(result.margin).toBe(2);
  });

  it('falta parcial: 1 hora de um bloco de 2', () => {
    const half = { id: 'p', subjectId: 'imu', date: '', start: '', missed: 1, cancelled: false };
    const result = presenceOf([occ(2, half), occ(2)]);
    expect(result.missed).toBe(1);
    expect(result.percent).toBe(0.75);
  });

  it('sem aulas ainda não há percentual', () => {
    expect(presenceOf([])).toMatchObject({ percent: null, status: 'sem-aulas' });
  });

  it('falta maior que o bloco é limitada ao tamanho dele', () => {
    const big = { id: 'p', subjectId: 'imu', date: '', start: '', missed: 5, cancelled: false };
    expect(presenceOf([occ(2, big)]).missed).toBe(2);
  });
});

describe('marcar a aula', () => {
  const base = EMPTY_STUDY;
  const item = occ(2);

  it('falta cria o registro, trocar atualiza o mesmo e presente apaga', () => {
    const faltou = markOccurrence(base, item, { kind: 'falta', hours: 2 }, 'r1');
    expect(faltou.attendance).toHaveLength(1);
    const found = { ...item, record: faltou.attendance[0] };
    expect(situationOf(found)).toEqual({ kind: 'falta', hours: 2 });
    const parcial = markOccurrence(faltou, found, { kind: 'falta', hours: 1 }, 'novo');
    expect(parcial.attendance).toEqual([expect.objectContaining({ id: 'r1', missed: 1 })]);
    const cancelada = markOccurrence(parcial, found, { kind: 'cancelada' }, 'novo');
    expect(situationOf({ ...item, record: cancelada.attendance[0] })).toEqual({
      kind: 'cancelada',
    });
    expect(markOccurrence(cancelada, found, { kind: 'presente' }, 'x').attendance).toEqual([]);
  });
});
