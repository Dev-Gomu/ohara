import type { Node as PMNode } from '@tiptap/pm/model';
import type { EditorState } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import { clampSize, resizeColumn, type SizeAxis } from '../../../core/notes/tableSize';

export interface TableSpot {
  tablePos: number;
  table: PMNode;
  row: number;
  col: number;
}

// Onde está o cursor dentro de uma tabela (sem células mescladas: o app não as cria).
export function spotOf(state: EditorState): TableSpot | null {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 1; depth--) {
    if ($from.node(depth).type.name !== 'tableRow') continue;
    return {
      tablePos: $from.before(depth - 1),
      table: $from.node(depth - 1),
      row: $from.index(depth - 1),
      col: $from.index(depth),
    };
  }
  return null;
}

function tableEl(view: EditorView, spot: TableSpot): HTMLTableElement | null {
  const dom = view.nodeDOM(spot.tablePos);
  if (!(dom instanceof HTMLElement)) return null;
  return dom instanceof HTMLTableElement ? dom : dom.querySelector('table');
}

export function measure(view: EditorView, spot: TableSpot, axis: SizeAxis): number {
  const table = tableEl(view, spot);
  const row = table?.rows[spot.row];
  if (!row) return 0;
  const box = (axis === 'width' ? row.cells[spot.col] : row)?.getBoundingClientRect();
  return Math.round(axis === 'width' ? (box?.width ?? 0) : (box?.height ?? 0));
}

export function setSize(view: EditorView, spot: TableSpot, axis: SizeAxis, target: number): void {
  const table = tableEl(view, spot);
  if (!table?.rows[0]) return;
  const { tr } = view.state;
  if (axis === 'height') {
    const pos = rowPos(spot, spot.row);
    const row = spot.table.child(spot.row);
    tr.setNodeMarkup(pos, undefined, { ...row.attrs, minHeight: clampSize('height', target) });
  } else {
    const widths = resizeColumn(
      Array.from(table.rows[0].cells, (cell) => cell.getBoundingClientRect().width),
      spot.col,
      target,
    );
    forEachCell(spot, (cell, pos, col) =>
      tr.setNodeMarkup(pos, undefined, { ...cell.attrs, colwidth: [widths[col] ?? target] }),
    );
  }
  view.dispatch(tr);
}

export function equalizeColumns(view: EditorView, spot: TableSpot): void {
  const { tr } = view.state;
  forEachCell(spot, (cell, pos) => tr.setNodeMarkup(pos, undefined, { ...cell.attrs, colwidth: null }));
  view.dispatch(tr);
}

function rowPos(spot: TableSpot, index: number): number {
  let pos = spot.tablePos + 1;
  for (let i = 0; i < index; i++) pos += spot.table.child(i).nodeSize;
  return pos;
}

function forEachCell(spot: TableSpot, run: (cell: PMNode, pos: number, col: number) => void): void {
  spot.table.forEach((row, _offset, index) => {
    let pos = rowPos(spot, index) + 1;
    row.forEach((cell, _o, col) => {
      run(cell, pos, col);
      pos += cell.nodeSize;
    });
  });
}
