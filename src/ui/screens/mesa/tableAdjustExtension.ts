import { Extension } from '@tiptap/core';
import { TableRow } from '@tiptap/extension-table';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import { clampSize, type SizeAxis } from '../../../core/notes/tableSize';
import { isAdjusting, setAdjusting, subscribeAdjusting } from '../../keyboard/tableAdjust';
import { measure, setSize, spotOf } from './tableOps';

// Altura é só mínima (D149): a linha guarda `minHeight` e a mostra como `height` (na tabela, mínimo).
export const SizedRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      minHeight: {
        default: null,
        parseHTML: (el: HTMLElement) => Number.parseInt(el.style.height, 10) || null,
        renderHTML: (attrs: { minHeight?: number | null }) =>
          attrs.minHeight ? { style: `height: ${attrs.minHeight}px` } : {},
      },
    };
  },
});

const key = new PluginKey('tableAdjust');
const REACH_MOUSE = 6;
const REACH_TOUCH = 16;

interface Drag {
  axis: SizeAxis;
  from: number;
  start: number;
}

function nearLine(view: EditorView, event: PointerEvent): SizeAxis | null {
  const reach = event.pointerType === 'mouse' ? REACH_MOUSE : REACH_TOUCH;
  const col = view.dom.querySelector('.adj-col')?.getBoundingClientRect();
  const row = view.dom.querySelector('.adj-lin')?.getBoundingClientRect();
  const table = view.dom.querySelector('.adj-tabela')?.getBoundingClientRect();
  if (!table) return null;
  const inY = event.clientY >= table.top - reach && event.clientY <= table.bottom + reach;
  const inX = event.clientX >= table.left - reach && event.clientX <= table.right + reach;
  if (col && inY && Math.abs(event.clientX - col.right) <= reach) return 'width';
  if (row && inX && Math.abs(event.clientY - row.bottom) <= reach) return 'height';
  return null;
}

// Linhas de destaque: a coluna e a linha do cursor, só no modo Ajustar.
function decorate(state: Parameters<typeof spotOf>[0]): DecorationSet | null {
  const spot = isAdjusting() ? spotOf(state) : null;
  if (!spot) return null;
  const decorations = [Decoration.node(spot.tablePos, spot.tablePos + spot.table.nodeSize, { class: 'adj-tabela' })];
  let rowPos = spot.tablePos + 1;
  spot.table.forEach((row, _o, r) => {
    let cellPos = rowPos + 1;
    row.forEach((cell, _c, c) => {
      const classes = [c === spot.col && 'adj-col', r === spot.row && 'adj-lin'].filter(Boolean).join(' ');
      if (classes) decorations.push(Decoration.node(cellPos, cellPos + cell.nodeSize, { class: classes }));
      cellPos += cell.nodeSize;
    });
    rowPos += row.nodeSize;
  });
  return DecorationSet.create(state.doc, decorations);
}

export const TableAdjust = Extension.create({
  name: 'tableAdjust',
  addProseMirrorPlugins() {
    let drag: Drag | null = null;
    return [
      new Plugin({
        key,
        props: {
          decorations: decorate,
          handleDOMEvents: {
            pointerdown: (view, event) => {
              if (!isAdjusting()) return false;
              const axis = nearLine(view, event);
              const spot = spotOf(view.state);
              if (!axis || !spot) return false;
              event.preventDefault();
              view.dom.setPointerCapture(event.pointerId);
              drag = { axis, from: axis === 'width' ? event.clientX : event.clientY, start: measure(view, spot, axis) };
              view.dom.dataset.perto = axis;
              return true;
            },
            pointermove: (view, event) => {
              const spot = spotOf(view.state);
              if (!drag) {
                const near = isAdjusting() && event.pointerType === 'mouse' ? nearLine(view, event) : null;
                view.dom.dataset.perto = near ?? '';
                view.dom.style.cursor = near === 'width' ? 'col-resize' : near === 'height' ? 'row-resize' : '';
                return false;
              }
              if (spot) {
                const now = drag.axis === 'width' ? event.clientX : event.clientY;
                setSize(view, spot, drag.axis, clampSize(drag.axis, drag.start + now - drag.from));
              }
              return true;
            },
            pointerup: (view) => {
              if (!drag) return false;
              drag = null;
              view.dom.dataset.perto = '';
              return true;
            },
            pointercancel: (view) => {
              drag = null;
              view.dom.dataset.perto = '';
              return false;
            },
          },
        },
        view: (view) => {
          // A decoração só muda com uma transação: ligar ou desligar o modo manda uma vazia.
          const refresh = () =>
            queueMicrotask(() => {
              if (!view.isDestroyed) view.dispatch(view.state.tr.setMeta(key, true));
            });
          const unsubscribe = subscribeAdjusting(refresh);
          return {
            update: (v) => {
              if (isAdjusting() && !spotOf(v.state)) setAdjusting(false);
            },
            destroy: unsubscribe,
          };
        },
      }),
    ];
  },
});
