import { describe, expect, it } from 'vitest';
import { createFixtures } from './fixtures';
import { normalize, search } from './search';

const data = createFixtures('2026-11-07');

describe('busca', () => {
  it('ignora acento e caixa', () => {
    expect(normalize('Atenção')).toBe('atencao');
    expect(search(data, 'atencao')[0]?.title).toBe('Atenção Primária');
  });

  it('acha pela sigla', () => {
    expect(search(data, 'imu')[0]).toMatchObject({ kind: 'materia', id: 'imu' });
  });

  it('acha aula e cartão, e o cartão aponta para a aula', () => {
    expect(search(data, 'complemento')[0]?.kind).toBe('aula');
    const card = search(data, 'TLR4').find((item) => item.kind === 'cartao');
    expect(data.lessons.some((lesson) => lesson.id === card?.target)).toBe(true);
  });

  it('acha símbolos gregos', () => {
    expect(search(data, 'TNF-α').length).toBeGreaterThan(0);
  });

  it('texto vazio não devolve nada', () => {
    expect(search(data, '   ')).toEqual([]);
  });

  it('limita a quantidade', () => {
    expect(search(data, 'a').length).toBeLessThanOrEqual(40);
  });
});
