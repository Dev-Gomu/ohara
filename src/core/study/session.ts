export type Grade = 1 | 2 | 3 | 4;

export interface Session {
  queue: readonly string[];
  flipped: boolean;
  total: number;
  answered: number;
  missed: number;
}

export function createSession(cardIds: readonly string[]): Session {
  return { queue: cardIds, flipped: false, total: cardIds.length, answered: 0, missed: 0 };
}

export function flip(session: Session): Session {
  return { ...session, flipped: !session.flipped };
}

// A data da próxima revisão vem do FSRS na Etapa 11. Aqui só se decide a fila da sessão.
export function rate(session: Session, grade: Grade): Session {
  const [card, ...rest] = session.queue;
  if (card === undefined || !session.flipped) return session;
  if (grade === 1) {
    return { ...session, queue: [...rest, card], flipped: false, missed: session.missed + 1 };
  }
  return { ...session, queue: rest, flipped: false, answered: session.answered + 1 };
}

export const isFinished = (session: Session): boolean => session.queue.length === 0;
