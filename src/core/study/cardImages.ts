// Imagens no texto do cartão (D158). A imagem é uma linha "{img:id}" no ponto onde foi colocada;
// o lado (frente ou verso) vem do registro da imagem. No editor, as da frente ficam logo depois do "@".
import { groupLines, splitLines, type LineEdit } from './cardLines';
import { IMAGE_LINE } from './cardText';
import type { CardImage, ImageSide } from './types';

export const MAX_IMAGES = 6;
// Lado maior da imagem depois da redução automática.
export const MAX_SIDE = 1600;

export type SideOf = (id: string) => ImageSide | undefined;

export const imageLine = (id: string): string => `{img:${id}}`;

export function imageIdOf(raw: string): string | null {
  return IMAGE_LINE.exec(raw)?.[1] ?? null;
}

// Imagem sem registro (apagada, ou de outro aparelho ainda não sincronizado) fica no verso.
export const isFrontImage = (raw: string, sideOf: SideOf): boolean => {
  const id = imageIdOf(raw);
  return id !== null && sideOf(id) === 'frente';
};

export function scaleTo(
  width: number,
  height: number,
  max = MAX_SIDE,
): { width: number; height: number } {
  const factor = Math.min(1, max / Math.max(width, height, 1));
  return {
    width: Math.max(1, Math.round(width * factor)),
    height: Math.max(1, Math.round(height * factor)),
  };
}

export function sideMap(images: readonly CardImage[]): SideOf {
  const sides = new Map(images.map((image) => [image.id, image.side]));
  return (id) => sides.get(id);
}

export interface CardSides {
  front: string[];
  back: string[];
}

// Ids das imagens de cada lado, na ordem do texto.
export function imagesBySide(text: string, sideOf: SideOf): CardSides {
  const sides: CardSides = { front: [], back: [] };
  for (const raw of splitLines(text)) {
    const id = imageIdOf(raw);
    if (id !== null) (sideOf(id) === 'frente' ? sides.front : sides.back).push(id);
  }
  return sides;
}

// Verso para desenhar: sem as linhas das imagens da frente.
export function backWithoutFront(answer: string, sideOf: SideOf): string {
  return splitLines(answer)
    .filter((raw) => !isFrontImage(raw, sideOf))
    .join('\n');
}

// Cartão (grupo do "@") que contém a linha.
export function groupOf(source: string, line: number): number[] {
  const groups = groupLines(source);
  return groups.find((group) => group.lines.includes(line))?.lines ?? groups.at(-1)?.lines ?? [];
}

// Lado onde entra uma imagem colada ou solta numa linha: na pergunta ou numa imagem da frente,
// vai para a frente; em qualquer outra linha, para o verso.
export function sideAt(source: string, line: number, sideOf: SideOf): ImageSide {
  const group = groupOf(source, line);
  const raw = splitLines(source)[line] ?? '';
  return line === group[0] || isFrontImage(raw, sideOf) ? 'frente' : 'verso';
}

export function countSide(source: string, line: number, side: ImageSide, sideOf: SideOf): number {
  const lines = splitLines(source);
  return groupOf(source, line).filter((index) => {
    const id = imageIdOf(lines[index] ?? '');
    return id !== null && (sideOf(id) ?? 'verso') === side;
  }).length;
}

// Põe as linhas de imagem no cartão da linha "line". Frente: depois da pergunta e das outras
// imagens da frente. Verso: depois da linha indicada (se for do verso) ou no fim do cartão.
export function insertImages(
  source: string,
  line: number,
  ids: readonly string[],
  side: ImageSide,
  sideOf: SideOf,
  afterLine = true,
): LineEdit {
  const lines = splitLines(source);
  const group = groupOf(source, line);
  const first = group[0] ?? 0;
  let at: number;
  if (side === 'frente') {
    at = first + 1;
    while (at <= (group.at(-1) ?? first) && isFrontImage(lines[at] ?? '', sideOf)) at += 1;
  } else {
    const inBack = afterLine && line !== first && !isFrontImage(lines[line] ?? '', sideOf);
    if (inBack) at = line + 1;
    else {
      at = (group.at(-1) ?? first) + 1;
      // Linhas em branco no fim do cartão ficam depois da imagem.
      while (at - 1 > first && (lines[at - 1] ?? '').trim() === '') at -= 1;
      while (at <= (group.at(-1) ?? first) && isFrontImage(lines[at] ?? '', sideOf)) at += 1;
    }
  }
  lines.splice(at, 0, ...ids.map(imageLine));
  return { source: lines.join('\n'), line: at + ids.length - 1, caret: 0 };
}

// Tira a linha da imagem; o cursor vai para a linha de cima.
export function removeImageLine(source: string, line: number): LineEdit {
  const lines = splitLines(source);
  lines.splice(line, 1);
  const next = Math.max(0, line - 1);
  return { source: lines.join('\n'), line: next, caret: (lines[next] ?? '').length };
}

export function lineOfImage(source: string, id: string): number {
  return splitLines(source).findIndex((raw) => imageIdOf(raw) === id);
}

// Imagens que nenhum texto usa mais (cartões salvos e rascunhos): podem sair do banco.
export function unusedImages(images: readonly CardImage[], texts: readonly string[]): string[] {
  const used = new Set(texts.flatMap((text) => splitLines(text).map(imageIdOf)));
  return images.filter((image) => !used.has(image.id)).map((image) => image.id);
}
