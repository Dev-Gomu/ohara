import type { Schedule } from './types';

// Cartão que nunca foi respondido: entra no Treino a partir de `due` (data local).
export const newSchedule = (due: string): Schedule => ({
  due,
  state: 0,
  stability: 0,
  difficulty: 0,
  reps: 0,
  lapses: 0,
  learningSteps: 0,
  scheduledDays: 0,
  lastReview: null,
});

const pad = (value: number): string => String(value).padStart(2, '0');

// Data e hora local, sem fuso: o texto se compara com a data pura ("2026-11-15").
export function localStamp(date: Date): string {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Data pura vale a meia-noite local; o construtor do Date leria "2026-11-15" como UTC.
export function parseStamp(text: string): Date {
  return new Date(text.length === 10 ? `${text}T00:00:00` : text);
}

export const dayOf = (stamp: string): string => stamp.slice(0, 10);
