import { clampRetention, RETENTION, schedule, validWeights, type Grade, type TrainParams } from './fsrs';
import { dayOf } from './schedule';
import type { Card, StudyData } from './types';

export const RETENTION_KEY = 'train.retention';
export const NEW_LIMIT_KEY = 'train.newPerDay';
// Padrão do Anki. null = sem limite.
export const NEW_LIMIT_STANDARD = 20;

export function newLimitOf(data: StudyData): number | null {
  const saved = data.settings.find((item) => item.id === NEW_LIMIT_KEY);
  if (!saved) return NEW_LIMIT_STANDARD;
  if (saved.value === 'none') return null;
  const value = Number(saved.value);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : NEW_LIMIT_STANDARD;
}

export function setNewLimit(data: StudyData, limit: number | null): StudyData {
  const setting = { id: NEW_LIMIT_KEY, value: limit === null ? 'none' : String(Math.max(0, Math.round(limit))) };
  return { ...data, settings: [...data.settings.filter((item) => item.id !== NEW_LIMIT_KEY), setting] };
}

// Novos que já entraram hoje: a resposta guarda o estado de antes (0 = era novo).
export function newSeenToday(data: StudyData, today: string): number {
  const seen = new Set<string>();
  for (const review of data.reviews) {
    if (review.state === 0 && dayOf(review.reviewedAt) === today) seen.add(review.cardId);
  }
  return seen.size;
}

// Quantos novos ainda cabem hoje; null = sem limite.
export function newLeftToday(data: StudyData, today: string): number | null {
  const limit = newLimitOf(data);
  return limit === null ? null : Math.max(0, limit - newSeenToday(data, today));
}

// Desfazer a resposta: o cartão volta à agenda de antes e a linha do histórico sai.
export function undoAnswer(data: StudyData, before: Card, reviewId: string): StudyData {
  return {
    ...data,
    cards: data.cards.map((item) => (item.id === before.id ? { ...item, ...scheduleOf(before) } : item)),
    reviews: data.reviews.filter((item) => item.id !== reviewId),
  };
}

const scheduleOf = (card: Card) => ({
  due: card.due,
  state: card.state,
  stability: card.stability,
  difficulty: card.difficulty,
  reps: card.reps,
  lapses: card.lapses,
  learningSteps: card.learningSteps,
  scheduledDays: card.scheduledDays,
  lastReview: card.lastReview,
});

export function retentionOf(data: StudyData): number {
  const saved = data.settings.find((item) => item.id === RETENTION_KEY);
  return saved ? clampRetention(Number(saved.value)) : RETENTION.standard;
}

export function setRetention(data: StudyData, value: number): StudyData {
  const setting = { id: RETENTION_KEY, value: String(clampRetention(Math.round(value * 100) / 100)) };
  const others = data.settings.filter((item) => item.id !== RETENTION_KEY);
  return { ...data, settings: [...others, setting] };
}

export const WEIGHTS_KEY = 'train.weights';
// Abaixo disso o otimizador não melhora a previsão (referência da comunidade do FSRS).
export const OPTIMIZE_MIN_REVIEWS = 1000;

export function weightsOf(data: StudyData): number[] | undefined {
  const saved = data.settings.find((item) => item.id === WEIGHTS_KEY);
  if (!saved) return undefined;
  try {
    const parsed: unknown = JSON.parse(saved.value);
    return validWeights(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

// null volta ao padrão. Pesos inválidos não entram: o agendamento nunca fica com dado torto.
export function setWeights(data: StudyData, weights: readonly number[] | null): StudyData {
  const others = data.settings.filter((item) => item.id !== WEIGHTS_KEY);
  if (weights === null || !validWeights(weights)) return { ...data, settings: others };
  return { ...data, settings: [...others, { id: WEIGHTS_KEY, value: JSON.stringify(weights) }] };
}

export function trainParams(data: StudyData, fuzz = true): TrainParams {
  const weights = weightsOf(data);
  return { retention: retentionOf(data), fuzz, ...(weights ? { weights } : {}) };
}

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
