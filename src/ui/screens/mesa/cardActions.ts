import type { KeyAction } from '../../../core/keyboard/actions';
import type { CardFormat } from '../../../core/study/cardFormat';

type Handler = (change: KeyAction) => boolean | void;

const FORMATS: readonly CardFormat[] = [
  'bold',
  'italic',
  'underline',
  'highlight',
  'superscript',
  'subscript',
  'bulletList',
  'orderedList',
];

// As teclas de formatação são as mesmas das Anotações: com o foco nos Cartões escrevem a marca
// no texto; fora deles seguem para o editor das Anotações.
export function cardFormatActions(
  inCards: () => boolean,
  format: (kind: CardFormat) => void,
  notes: Partial<Record<KeyAction['type'], Handler>>,
): Partial<Record<KeyAction['type'], Handler>> {
  const result: Partial<Record<KeyAction['type'], Handler>> = {};
  for (const kind of FORMATS) {
    result[kind] = (change) => {
      if (inCards()) return void format(kind);
      return notes[kind]?.(change);
    };
  }
  return result;
}
