import { describe, expect, it } from 'vitest';
import {
  backWithoutFront,
  countSide,
  imageIdOf,
  imagesBySide,
  insertImages,
  removeImageLine,
  scaleTo,
  sideAt,
  unusedImages,
  type SideOf,
} from './cardImages';
import { backspaceAtStart, markLength } from './cardLines';
import { backPreview, parseDrafts, parseLine } from './cardText';
import { backHtml } from './ankiExport';
import type { CardImage } from './types';

const sides: Record<string, 'frente' | 'verso'> = {
  f1: 'frente',
  f2: 'frente',
  v1: 'verso',
  v2: 'verso',
};
const sideOf: SideOf = (id) => sides[id];
const source = ['@ Onde fica o rim?', '{img:f1}', 'Retroperitônio', '# Relações', '- Adrenal'].join(
  '\n',
);

describe('linha de imagem', () => {
  it('reconhece só a linha inteira', () => {
    expect(imageIdOf('{img:ab-12}')).toBe('ab-12');
    expect(imageIdOf('texto {img:ab}')).toBeNull();
    expect(parseLine('{img:ab}')).toEqual({ kind: 'image', text: 'ab' });
    expect(markLength('{img:ab}')).toBe(8);
  });

  it('fica fora do começo do verso e da exportação para o Anki', () => {
    expect(backPreview('{img:v1}\nMacrófago')).toBe('Macrófago');
    expect(backHtml('{img:v1}\nMacrófago')).not.toContain('img');
  });

  it('vai junto no verso ao salvar e separa os lados pelo registro', () => {
    const [draft] = parseDrafts(source);
    expect(draft?.front).toBe('Onde fica o rim?');
    expect(imagesBySide(draft?.back ?? '', sideOf)).toEqual({ front: ['f1'], back: [] });
    expect(backWithoutFront('{img:f1}\n{img:v1}\nTexto', sideOf)).toBe('{img:v1}\nTexto');
  });
});

describe('inserir imagens', () => {
  it('na frente, logo depois da pergunta e das outras da frente', () => {
    const edit = insertImages(source, 3, ['f2'], 'frente', sideOf);
    expect(edit.source.split('\n').slice(0, 3)).toEqual([
      '@ Onde fica o rim?',
      '{img:f1}',
      '{img:f2}',
    ]);
    expect(edit.line).toBe(2);
  });

  it('no verso, depois da linha do cursor', () => {
    const edit = insertImages(source, 3, ['v1', 'v2'], 'verso', sideOf);
    expect(edit.source.split('\n').slice(3, 6)).toEqual(['# Relações', '{img:v1}', '{img:v2}']);
    expect(edit.line).toBe(5);
  });

  it('no verso a partir da pergunta: no fim do cartão, antes do próximo "@"', () => {
    const two = `${source}\n\n@ Outra`;
    const edit = insertImages(two, 0, ['v1'], 'verso', sideOf);
    expect(edit.source.split('\n').slice(4, 7)).toEqual(['- Adrenal', '{img:v1}', '']);
  });

  it('verso só com imagem continua verso', () => {
    const edit = insertImages('@ Pergunta', 0, ['v1'], 'verso', sideOf);
    expect(edit.source).toBe('@ Pergunta\n{img:v1}');
    expect(imagesBySide(parseDrafts(edit.source)[0]?.back ?? '', sideOf).back).toEqual(['v1']);
  });

  it('lado e contagem pela linha do cursor', () => {
    expect(sideAt(source, 0, sideOf)).toBe('frente');
    expect(sideAt(source, 1, sideOf)).toBe('frente');
    expect(sideAt(source, 2, sideOf)).toBe('verso');
    expect(countSide(source, 4, 'frente', sideOf)).toBe(1);
    expect(countSide(source, 4, 'verso', sideOf)).toBe(0);
  });

  it('Backspace no começo da linha não gruda texto na imagem de cima', () => {
    expect(backspaceAtStart(source, 2)).toEqual({ source, line: 1, caret: 0 });
  });

  it('remover tira a linha e sobe o cursor', () => {
    expect(removeImageLine(source, 1)).toEqual({
      source: ['@ Onde fica o rim?', 'Retroperitônio', '# Relações', '- Adrenal'].join('\n'),
      line: 0,
      caret: 18,
    });
  });
});

describe('redução e limpeza', () => {
  it('reduz o lado maior a 1600 e não amplia', () => {
    expect(scaleTo(3200, 1600)).toEqual({ width: 1600, height: 800 });
    expect(scaleTo(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('acha imagens que nenhum texto usa', () => {
    const image = (id: string): CardImage => ({
      id,
      lessonId: 'a',
      side: 'verso',
      mime: 'image/jpeg',
      width: 1,
      height: 1,
      data: '',
    });
    expect(unusedImages([image('f1'), image('v9')], [source])).toEqual(['v9']);
  });
});
