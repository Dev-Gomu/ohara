import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  type Card as FsrsCard,
  type Grade as FsrsGrade,
} from 'ts-fsrs';
import { localStamp, parseStamp } from './schedule';
import type { CardState, Review, Schedule } from './types';

// Função fina em volta do ts-fsrs (D43, D86): o resto do app só conhece estes tipos.
export type Grade = 1 | 2 | 3 | 4;

export const GRADES: readonly Grade[] = [1, 2, 3, 4];

export interface TrainParams {
  retention: number;
  fuzz: boolean;
  // Os 21 pesos do FSRS-6 ajustados pelo otimizador (B06); ausente = padrão da biblioteca.
  weights?: readonly number[];
}

export const WEIGHT_COUNT = 21;

export const validWeights = (value: unknown): value is number[] =>
  Array.isArray(value) && value.length === WEIGHT_COUNT && value.every((n) => typeof n === 'number' && Number.isFinite(n));

export const RETENTION = { min: 0.8, max: 0.97, standard: 0.9 } as const;

export const clampRetention = (value: number): number =>
  Number.isFinite(value)
    ? Math.min(RETENTION.max, Math.max(RETENTION.min, value))
    : RETENTION.standard;

export function toLibrary(card: Schedule): FsrsCard {
  const base: FsrsCard = {
    due: parseStamp(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    scheduled_days: card.scheduledDays,
    learning_steps: card.learningSteps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
  };
  return card.lastReview === null ? base : { ...base, last_review: parseStamp(card.lastReview) };
}

export function fromLibrary(card: FsrsCard): Schedule {
  return {
    due: localStamp(card.due),
    state: card.state as CardState,
    stability: card.stability,
    difficulty: card.difficulty,
    reps: card.reps,
    lapses: card.lapses,
    learningSteps: card.learning_steps,
    scheduledDays: card.scheduled_days,
    lastReview: card.last_review ? localStamp(card.last_review) : null,
  };
}

// Passos de aprendizado e reaprendizado: os padrões da biblioteca (1m, 10m e 10m).
const scheduler = (params: TrainParams) =>
  fsrs(
    generatorParameters({
      request_retention: clampRetention(params.retention),
      enable_fuzz: params.fuzz,
      ...(params.weights ? { w: params.weights } : {}),
    }),
  );

export interface Answer {
  schedule: Schedule;
  review: Omit<Review, 'id' | 'cardId'>;
}

export function schedule(card: Schedule, grade: Grade, now: Date, params: TrainParams): Answer {
  const { card: next, log } = scheduler(params).next(toLibrary(card), now, grade as FsrsGrade);
  const result = fromLibrary(next);
  return {
    schedule: result,
    review: {
      grade,
      state: log.state as CardState,
      due: result.due,
      stability: next.stability,
      difficulty: next.difficulty,
      scheduledDays: next.scheduled_days,
      learningSteps: next.learning_steps,
      reviewedAt: localStamp(now),
    },
  };
}

// Próxima data de cada botão, para mostrar embaixo do verso.
export function preview(card: Schedule, now: Date, params: TrainParams): Record<Grade, Date> {
  const options = scheduler(params).repeat(toLibrary(card), now);
  return {
    1: options[1].card.due,
    2: options[2].card.due,
    3: options[3].card.due,
    4: options[4].card.due,
  };
}

// Rótulo curto do intervalo: "1 min", "10 min", "3 h", "4 d", "2 m", "1,5 a".
export function intervalLabel(from: Date, to: Date): string {
  const minutes = Math.max(1, Math.round((to.getTime() - from.getTime()) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(minutes / 1440);
  if (days < 30) return `${days} d`;
  if (days < 365) return `${Math.round(days / 30)} m`;
  return `${(days / 365).toFixed(1).replace('.', ',').replace(',0', '')} a`;
}

export const emptyLibraryCard = (now: Date): Schedule => fromLibrary(createEmptyCard(now));
