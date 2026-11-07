import { describe, expect, it } from 'vitest';
import { createSession, flip, isFinished, rate } from './session';

describe('sessão de treino', () => {
  it('não aceita resposta antes de virar o cartão', () => {
    const session = createSession(['a', 'b']);
    expect(rate(session, 3)).toBe(session);
  });

  it('Bom tira o cartão da fila', () => {
    const after = rate(flip(createSession(['a', 'b'])), 3);
    expect(after).toMatchObject({ queue: ['b'], answered: 1, flipped: false });
  });

  it('Errei manda o cartão para o fim da fila', () => {
    const after = rate(flip(createSession(['a', 'b'])), 1);
    expect(after).toMatchObject({ queue: ['b', 'a'], missed: 1, answered: 0 });
  });

  it('termina quando a fila esvazia', () => {
    const after = rate(flip(createSession(['a'])), 4);
    expect(isFinished(after)).toBe(true);
  });
});
