import type { Grade } from './fsrs';
import { dayOf, parseStamp } from './schedule';
import type { Card } from './types';

export type { Grade } from './fsrs';

// Quem volta à mesma sessão: o cartão cuja nova data cai em até 20 minutos (Etapa 11, regra 2).
export const RETURN_MS = 20 * 60_000;
export const ADVANCE_LIMIT = 20;

interface Waiting {
  id: string;
  due: string;
}

export interface Session {
  // Fila do dia, na ordem da regra 1; `again` são os que voltaram, pela data.
  queue: readonly string[];
  again: readonly Waiting[];
  current: string | null;
  flipped: boolean;
  total: number;
  // Cartões que já saíram da sessão; `answers` conta cada resposta, `missed` os Errei.
  done: number;
  answers: number;
  missed: number;
}

const byDue = (a: Card, b: Card): number => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0);

// Regra 1: vencidos até o fim de hoje. Aprendendo e reaprendendo pela data, depois revisão
// pela data, por último os novos na ordem de criação (a ordem do banco), até `newLeft` (null = todos).
export function dueQueue(cards: readonly Card[], today: string, newLeft: number | null = null): Card[] {
  const due = cards.filter((card) => dayOf(card.due) <= today);
  const learning = due.filter((card) => card.state === 1 || card.state === 3).sort(byDue);
  const review = due.filter((card) => card.state === 2).sort(byDue);
  const fresh = due.filter((card) => card.state === 0);
  return [...learning, ...review, ...(newLeft === null ? fresh : fresh.slice(0, newLeft))];
}

// Regra 5 (Adiantar, D80): sem vencidos, os 20 de data mais próxima.
export function advanceQueue(cards: readonly Card[]): Card[] {
  return [...cards].sort(byDue).slice(0, ADVANCE_LIMIT);
}

export const sessionQueue = (cards: readonly Card[], today: string, newLeft: number | null = null): Card[] => {
  const due = dueQueue(cards, today, newLeft);
  return due.length > 0 ? due : advanceQueue(cards);
};

// Regra 3: primeiro quem voltou e já venceu; depois a fila do dia; sem nada, o que volta antes.
function pick(queue: readonly string[], again: readonly Waiting[], now: Date): Partial<Session> {
  const ready = again[0] && parseStamp(again[0].due) <= now ? again[0] : undefined;
  if (ready) return { current: ready.id, queue, again: again.slice(1) };
  const [first, ...rest] = queue;
  if (first !== undefined) return { current: first, queue: rest, again };
  const [soon, ...later] = again;
  return { current: soon?.id ?? null, queue, again: later };
}

export function createSession(cardIds: readonly string[], now: Date): Session {
  const base = { flipped: false, total: cardIds.length, done: 0, answers: 0, missed: 0 };
  return { ...base, current: null, again: [], queue: cardIds, ...pick(cardIds, [], now) } as Session;
}

export function flip(session: Session): Session {
  return session.current === null ? session : { ...session, flipped: !session.flipped };
}

// `due` é a nova data do cartão, já gravada pelo FSRS. Regra 2 decide se ele volta.
export function rate(session: Session, grade: Grade, due: string, now: Date): Session {
  const card = session.current;
  if (card === null || !session.flipped) return session;
  const comesBack = parseStamp(due).getTime() - now.getTime() <= RETURN_MS;
  const again = comesBack
    ? [...session.again, { id: card, due }].sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))
    : session.again;
  return {
    ...session,
    ...pick(session.queue, again, now),
    flipped: false,
    done: session.done + (comesBack ? 0 : 1),
    answers: session.answers + 1,
    missed: session.missed + (grade === 1 ? 1 : 0),
  };
}

export const isFinished = (session: Session): boolean => session.current === null;

// Cartão sumiu (excluído no meio da sessão): segue para o próximo sem contar resposta.
export function skip(session: Session, now: Date): Session {
  return { ...session, ...pick(session.queue, session.again, now), flipped: false, done: session.done + 1 };
}
