import type { LineSpot } from '../../core/keyboard/keys';

// Uma linha visual cabe em ~1,6 vezes a altura da letra; acima disso o texto quebrou em mais linhas.
function isSingleRow(element: HTMLTextAreaElement): boolean {
  const style = getComputedStyle(element);
  const line = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.4;
  return element.scrollHeight < line * 1.6;
}

// Linha do cartão novo em edição (D138): diz ao resolvedor onde está o cursor na linha.
export function cardLineContext(): readonly LineSpot[] | undefined {
  const element = document.activeElement;
  // Linha de imagem (D158): não há texto, então Enter, Delete e as setas são sempre do cartão.
  if (element instanceof HTMLElement && element.hasAttribute('data-card-image')) {
    return ['image', 'top', 'bottom'];
  }
  if (!(element instanceof HTMLTextAreaElement) || !element.hasAttribute('data-card-line')) {
    return undefined;
  }
  const { selectionStart, selectionEnd, value } = element;
  const spots: LineSpot[] = ['any'];
  const side = element.getAttribute('data-card-side');
  if (side === 'front' || side === 'back') spots.push(side);
  const collapsed = selectionStart === selectionEnd;
  const single = isSingleRow(element);
  if (collapsed && selectionStart === 0) spots.push('start', 'top');
  if (collapsed && selectionStart === value.length) spots.push('bottom');
  if (collapsed && single) spots.push('top', 'bottom');
  return spots;
}
