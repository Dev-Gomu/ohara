import { describe, expect, it } from 'vitest';
import { EMPTY_STUDY } from './create';
import { newSchedule } from './schedule';
import {
  answerCard,
  newLeftToday,
  newLimitOf,
  nextDue,
  retentionOf,
  setNewLimit,
  setRetention,
  setWeights,
  weightsOf,
  stateCounts,
  trainParams,
  undoAnswer,
} from './train';

const NOW = new Date(2026, 10, 15, 10, 0, 0);
const data = {
  ...EMPTY_STUDY,
  cards: [{ id: 'c', lessonId: 'l', question: 'q', answer: 'a', ...newSchedule('2026-11-15') }],
};

describe('treino no banco', () => {
  it('uma resposta grava o cartão e a linha do histórico juntos', () => {
    const after = answerCard(data, 'c', 3, NOW, trainParams(data, false), 'r1');
    expect(after.cards[0]).toMatchObject({ state: 1, reps: 1, due: '2026-11-15T10:10:00' });
    expect(after.reviews).toEqual([expect.objectContaining({ id: 'r1', cardId: 'c', grade: 3 })]);
  });

  it('cartão que sumiu não muda nada', () => {
    expect(answerCard(data, 'x', 3, NOW, trainParams(data), 'r')).toBe(data);
  });

  it('retenção: padrão 90%, limites de 80% a 97%', () => {
    expect(retentionOf(data)).toBe(0.9);
    expect(retentionOf(setRetention(data, 0.95))).toBe(0.95);
    expect(retentionOf(setRetention(data, 0.5))).toBe(0.8);
    expect(retentionOf(setRetention(setRetention(data, 0.99), 0.93)).toString()).toBe('0.93');
    expect(setRetention(setRetention(data, 0.85), 0.86).settings).toHaveLength(1);
  });

  it('próximo vencimento e contagem por estado', () => {
    expect(nextDue([{ due: '2026-11-20' }, { due: '2026-11-16T08:00:00' }])).toBe('2026-11-16T08:00:00');
    expect(nextDue([])).toBeNull();
    expect(stateCounts([{ state: 0 }, { state: 1 }, { state: 3 }, { state: 2 }])).toEqual({ fresh: 1, learning: 2, review: 1 });
  });

  it('desfazer volta a agenda de antes e tira a linha do histórico', () => {
    const before = data.cards[0];
    if (!before) throw new Error('sem cartão');
    const answered = answerCard(data, 'c', 1, NOW, trainParams(data, false), 'r1');
    const undone = undoAnswer(answered, before, 'r1');
    expect(undone.cards[0]).toEqual(before);
    expect(undone.reviews).toEqual([]);
  });

  it('limite de novos: padrão 20, sem limite, e desconta os novos já vistos hoje', () => {
    expect(newLimitOf(data)).toBe(20);
    expect(newLimitOf(setNewLimit(data, null))).toBeNull();
    const limited = setNewLimit(data, 5);
    const once = answerCard(limited, 'c', 1, NOW, trainParams(limited, false), 'r1');
    const twice = answerCard(once, 'c', 3, new Date(NOW.getTime() + 60_000), trainParams(once, false), 'r2');
    expect(newLeftToday(twice, '2026-11-15')).toBe(4);
    expect(newLeftToday(twice, '2026-11-16')).toBe(5);
    expect(newLeftToday(setNewLimit(twice, null), '2026-11-15')).toBeNull();
  });

  it('pesos ajustados entram no agendamento; inválidos são ignorados', () => {
    const later = new Date(NOW.getTime() + 60_000);
    const base = trainParams(data, false);
    const plain = answerCard(data, 'c', 4, later, base, 'r');
    const weights = [0.5, 2.5, 4, 20, 6.4, 0.83, 3, 0.001, 1.87, 0.17, 0.8, 1.48, 0.06, 0.26, 1.65, 0.6, 1.87, 0.54, 0.09, 0.07, 0.15];
    const tuned = setWeights(data, weights);
    expect(weightsOf(tuned)).toEqual(weights);
    const custom = answerCard(tuned, 'c', 4, later, trainParams(tuned, false), 'r');
    expect(custom.cards[0]?.due).not.toBe(plain.cards[0]?.due);
    expect(weightsOf(setWeights(data, [1, 2]))).toBeUndefined();
    expect(weightsOf(setWeights(tuned, null))).toBeUndefined();
    expect(trainParams({ ...data, settings: [{ id: 'train.weights', value: 'x' }] }).weights).toBeUndefined();
  });
});
