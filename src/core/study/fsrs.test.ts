import { describe, expect, it } from 'vitest';
import { fromLibrary, intervalLabel, preview, schedule, toLibrary, type TrainParams } from './fsrs';
import { localStamp, newSchedule, parseStamp } from './schedule';
import type { Schedule } from './types';

const NOW = new Date(2026, 10, 15, 10, 0, 0);
const PARAMS: TrainParams = { retention: 0.9, fuzz: false };
const MIN = 60_000;
const DAY = 86_400_000;

const fresh = (): Schedule => newSchedule('2026-11-15');
const at = (card: Schedule): number => parseStamp(card.due).getTime();

// Cartão em revisão: Fácil num novo e depois Bom, 10 dias mais tarde.
function inReview(): { card: Schedule; when: Date } {
  const first = schedule(fresh(), 4, NOW, PARAMS).schedule;
  const when = new Date(NOW.getTime() + 10 * DAY);
  return { card: schedule(first, 3, when, PARAMS).schedule, when };
}

describe('FSRS', () => {
  it('novo + Bom vai a aprendendo, de volta em 10 min', () => {
    const next = schedule(fresh(), 3, NOW, PARAMS).schedule;
    expect(next.state).toBe(1);
    expect(at(next) - NOW.getTime()).toBe(10 * MIN);
  });

  it('novo + Fácil vai a revisão, em pelo menos 1 dia', () => {
    const next = schedule(fresh(), 4, NOW, PARAMS).schedule;
    expect(next.state).toBe(2);
    expect(at(next) - NOW.getTime()).toBeGreaterThanOrEqual(DAY);
  });

  it('em revisão, Errei < Difícil < Bom < Fácil', () => {
    const { card, when } = inReview();
    expect(card.state).toBe(2);
    const dates = preview(card, when, PARAMS);
    expect(dates[1] < dates[2]).toBe(true);
    expect(dates[2] < dates[3]).toBe(true);
    expect(dates[3] < dates[4]).toBe(true);
  });

  it('revisão + Errei vai a reaprendendo e soma um lapso', () => {
    const { card, when } = inReview();
    const next = schedule(card, 1, when, PARAMS).schedule;
    expect(next.state).toBe(3);
    expect(next.lapses).toBe(card.lapses + 1);
  });

  it('retenção maior dá intervalo menor', () => {
    const { card, when } = inReview();
    const high = preview(card, when, { ...PARAMS, retention: 0.95 })[3];
    const low = preview(card, when, { ...PARAMS, retention: 0.85 })[3];
    expect(high < low).toBe(true);
  });

  it('a resposta traz a linha do histórico', () => {
    const { schedule: next, review } = schedule(fresh(), 3, NOW, PARAMS);
    expect(review).toMatchObject({ grade: 3, state: 0, due: next.due, reviewedAt: localStamp(NOW) });
  });

  it('ida e volta sem perda, com e sem última revisão', () => {
    expect(fromLibrary(toLibrary(fresh()))).toEqual({ ...fresh(), due: '2026-11-15T00:00:00' });
    const { card } = inReview();
    expect(fromLibrary(toLibrary(card))).toEqual(card);
    expect(card.lastReview).not.toBeNull();
  });

  it('rótulo curto do intervalo', () => {
    const plus = (ms: number) => new Date(NOW.getTime() + ms);
    expect(intervalLabel(NOW, plus(MIN))).toBe('1 min');
    expect(intervalLabel(NOW, plus(10 * MIN))).toBe('10 min');
    expect(intervalLabel(NOW, plus(3 * 60 * MIN))).toBe('3 h');
    expect(intervalLabel(NOW, plus(4 * DAY))).toBe('4 d');
    expect(intervalLabel(NOW, plus(60 * DAY))).toBe('2 m');
    expect(intervalLabel(NOW, plus(365 * DAY))).toBe('1 a');
    expect(intervalLabel(NOW, plus(548 * DAY))).toBe('1,5 a');
  });
});
