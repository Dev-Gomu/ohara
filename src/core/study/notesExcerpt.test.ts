import { describe, expect, it } from 'vitest';
import { notesExcerpt } from './queries';

describe('notesExcerpt', () => {
  it('tira as marcas do editor e junta os parágrafos', () => {
    expect(notesExcerpt('<p>Tipo I</p><p>IgE &amp; mastócitos</p>')).toBe('Tipo I IgE & mastócitos');
  });
  it('corta no limite com reticências', () => {
    expect(notesExcerpt('a'.repeat(30), 10)).toBe(`${'a'.repeat(10)}…`);
  });
  it('não repete o título que abre a anotação', () => {
    expect(notesExcerpt('<h1>Aula</h1><p>Texto</p>')).toBe('Texto');
  });
  it('corta na palavra inteira', () => {
    expect(notesExcerpt('abc defgh ijk', 11)).toBe('abc defgh…');
  });
  it('anotação vazia dá texto vazio', () => {
    expect(notesExcerpt('<p></p>')).toBe('');
  });
});
