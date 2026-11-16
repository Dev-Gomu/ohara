import { describe, expect, it } from 'vitest';
import { EMPTY_STUDY } from './create';
import { newSchedule } from './schedule';
import { answerCard, nextDue, retentionOf, setRetention, stateCounts, trainParams } from './train';

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
});
