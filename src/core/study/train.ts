import { clampRetention, RETENTION, schedule, type Grade, type TrainParams } from './fsrs';
import type { StudyData } from './types';

export const RETENTION_KEY = 'train.retention';

export function retentionOf(data: StudyData): number {
  const saved = data.settings.find((item) => item.id === RETENTION_KEY);
  return saved ? clampRetention(Number(saved.value)) : RETENTION.standard;
}

export function setRetention(data: StudyData, value: number): StudyData {
  const setting = { id: RETENTION_KEY, value: String(clampRetention(Math.round(value * 100) / 100)) };
  const others = data.settings.filter((item) => item.id !== RETENTION_KEY);
  return { ...data, settings: [...others, setting] };
}

export const trainParams = (data: StudyData, fuzz = true): TrainParams => ({ retention: retentionOf(data), fuzz });

// Uma resposta numa escrita só: o cartão com a nova agenda e a linha do histórico.
export function answerCard(
  data: StudyData,
  cardId: string,
  grade: Grade,
  now: Date,
  params: TrainParams,
  reviewId: string,
): StudyData {
  const card = data.cards.find((item) => item.id === cardId);
  if (!card) return data;
  const { schedule: next, review } = schedule(card, grade, now, params);
  return {
    ...data,
    cards: data.cards.map((item) => (item === card ? { ...item, ...next } : item)),
    reviews: [...data.reviews, { id: reviewId, cardId, ...review }],
  };
}

// Próximo vencimento entre os cartões do recorte (para o resumo do fim da sessão).
export function nextDue(cards: readonly { due: string }[]): string | null {
  return cards.reduce<string | null>((soonest, card) => (soonest === null || card.due < soonest ? card.due : soonest), null);
}

export interface StateCounts {
  fresh: number;
  learning: number;
  review: number;
}

// D181: Novos, Aprendendo e Revisar, só entre os que entram hoje.
export function stateCounts(cards: readonly { state: number }[]): StateCounts {
  const counts = { fresh: 0, learning: 0, review: 0 };
  for (const card of cards) {
    if (card.state === 0) counts.fresh += 1;
    else if (card.state === 2) counts.review += 1;
    else counts.learning += 1;
  }
  return counts;
}
