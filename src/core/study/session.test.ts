import { describe, expect, it } from 'vitest';
import { newSchedule } from './schedule';
import { advanceQueue, createSession, dueQueue, flip, isFinished, rate, sessionQueue } from './session';
import type { Card, CardState } from './types';

const NOW = new Date(2026, 10, 15, 10, 0, 0);
const TODAY = '2026-11-15';

const card = (id: string, due: string, state: CardState = 0): Card => ({
  id,
  lessonId: 'l',
  question: id,
  answer: '',
  ...newSchedule(due),
  state,
});

const ids = (cards: readonly Card[]) => cards.map((item) => item.id);

describe('fila do dia (regra 1)', () => {
  it('aprendendo, depois revisão, depois novos na ordem de criação', () => {
    const cards = [
      card('novo-b', TODAY),
      card('rev-2', '2026-11-14T09:00:00', 2),
      card('apr', '2026-11-15T09:30:00', 1),
      card('novo-a', '2026-11-10'),
      card('rev-1', '2026-11-13T09:00:00', 2),
      card('reapr', '2026-11-15T08:00:00', 3),
      card('amanha', '2026-11-16T08:00:00', 2),
    ];
    expect(ids(dueQueue(cards, TODAY))).toEqual(['reapr', 'apr', 'rev-1', 'rev-2', 'novo-b', 'novo-a']);
  });

  it('entra quem vence mais tarde hoje', () => {
    expect(ids(dueQueue([card('tarde', '2026-11-15T22:00:00', 2)], TODAY))).toEqual(['tarde']);
  });

  it('sem vencidos, Adiantar pega os 20 mais próximos', () => {
    const future = Array.from({ length: 25 }, (_, n) => card(`f${n}`, `2026-12-${String(25 - n).padStart(2, '0')}`, 2));
    const queue = sessionQueue(future, TODAY);
    expect(queue).toHaveLength(20);
    expect(queue[0]?.id).toBe('f24');
    expect(advanceQueue(future)[19]?.id).toBe('f5');
  });
});

describe('sessão de treino', () => {
  const start = () => createSession(['a', 'b'], NOW);

  it('não aceita resposta antes de virar o cartão', () => {
    const session = start();
    expect(rate(session, 3, '2026-11-15T10:10:00', NOW)).toBe(session);
  });

  it('volta em até 20 min e reaparece na posição da data (regra 2)', () => {
    const later = new Date(NOW.getTime() + 11 * 60_000);
    const one = rate(flip(start()), 3, '2026-11-15T10:10:00', NOW);
    expect(one).toMatchObject({ current: 'b', done: 0, answers: 1 });
    const two = rate(flip(one), 4, '2026-11-20T08:00:00', later);
    expect(two).toMatchObject({ current: 'a', done: 1, answers: 2 });
  });

  it('data além de 20 min tira o cartão da sessão', () => {
    const after = rate(flip(start()), 3, '2026-11-15T10:21:00', NOW);
    expect(after.again).toEqual([]);
    expect(after.done).toBe(1);
  });

  it('ninguém vencido: mostra o que volta antes, sem esperar (regra 3)', () => {
    const one = rate(flip(createSession(['a'], NOW)), 1, '2026-11-15T10:01:00', NOW);
    expect(one).toMatchObject({ current: 'a', missed: 1, answers: 1 });
  });

  it('quem voltou e venceu passa à frente da fila do dia', () => {
    const one = rate(flip(createSession(['a', 'b', 'c'], NOW)), 1, '2026-11-15T10:01:00', NOW);
    const later = new Date(NOW.getTime() + 2 * 60_000);
    const two = rate(flip(one), 4, '2026-11-25T08:00:00', later);
    expect(two.current).toBe('a');
  });

  it('termina quando a fila esvazia (regra 4)', () => {
    const after = rate(flip(createSession(['a'], NOW)), 4, '2026-11-20T08:00:00', NOW);
    expect(isFinished(after)).toBe(true);
    expect(after).toMatchObject({ answers: 1, done: 1, missed: 0 });
  });
});
