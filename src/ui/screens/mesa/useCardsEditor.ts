import { useLayoutEffect, useRef, useState } from 'react';
import { formatCard, insertCloze, type CardFormat } from '../../../core/study/cardFormat';
import {
  backspaceAtStart,
  locate,
  markLength,
  offsetOf,
  splitAt,
  splitLines,
  type LineEdit,
} from '../../../core/study/cardLines';
import {
  appendCard,
  expandDrafts,
  isComplete,
  keepIncomplete,
  parseDrafts,
  type Draft,
} from '../../../core/study/cardText';
import { imageIdOf } from '../../../core/study/cardImages';
import { addCards } from '../../../core/study/create';
import { symbolAtCaret } from '../../../core/study/symbols';
import { dispatch } from '../../keyboard/store';
import { useScreenMemory } from '../../study/screenMemory';
import { storage, today } from '../../study/study';

export type CardsMode = 'novo' | 'salvos';

export interface CardsEditor {
  mode: CardsMode;
  setMode: (mode: CardsMode) => void;
  source: string;
  drafts: Draft[];
  ready: number;
  saved: number | null;
  save: () => void;
  newCard: () => void;
  // Cartão aberto no lugar da linha, na lista de salvos (D151).
  openId: string | null;
  setOpenId: (id: string | null) => void;
  // Linha em edição no cartão novo (D138): só ela mostra o texto cru.
  line: number;
  activate: (line: number) => void;
  typeLine: (value: string, caret: number) => void;
  format: (format: CardFormat) => void;
  cloze: (same: boolean) => void;
  lineActions: {
    cardLineSplit: () => void;
    cardLineBack: () => void;
    cardLineMove: (delta: -1 | 1) => void;
  };
  field: React.RefObject<HTMLTextAreaElement | null>;
  // Linha de imagem em edição (D158): recebe o foco no lugar do campo de texto.
  imageField: React.RefObject<HTMLDivElement | null>;
  // Aplica uma troca no texto inteiro e põe o cursor onde ela pede (usado pelas imagens).
  replace: (edit: LineEdit) => void;
  refocus: () => void;
}

interface Request {
  start: number;
  end: number;
}

// O rascunho fica na memória da tela, por aula, até salvar (não sobrevive a fechar o app).
export function useCardsEditor(blockId: string, lessonId: string): CardsEditor {
  const [mode, setMode] = useScreenMemory<CardsMode>('mesa.cartoes.modo', 'novo');
  const [source, setSource] = useScreenMemory(`mesa.cartoes.rascunho.${lessonId}`, '');
  const [active, setActive] = useState(-1);
  // Posição do cursor (na linha crua) que a próxima pintura deve restaurar.
  const [request, setRequest] = useState<Request | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const imageField = useRef<HTMLDivElement>(null);
  const lines = splitLines(source);
  const line = active < 0 || active >= lines.length ? lines.length - 1 : active;
  const raw = lines[line] ?? '';
  const drafts = parseDrafts(source);
  const ready = expandDrafts(drafts.filter(isComplete)).length;

  useLayoutEffect(() => {
    if (request === null) return;
    const image = imageIdOf(raw) !== null ? imageField.current : null;
    const area = field.current;
    if (!image && !area) return;
    if (image) image.focus();
    else if (area) {
      const prefix = markLength(raw);
      area.focus();
      area.setSelectionRange(Math.max(0, request.start - prefix), Math.max(0, request.end - prefix));
    }
    setRequest(null);
  }, [request, raw]);

  const write = (next: string): void => {
    setSource(next);
    setSaved(null);
  };
  const apply = (edit: LineEdit): void => {
    write(edit.source);
    setActive(edit.line);
    setRequest({ start: edit.caret, end: edit.caret });
  };
  const selection = (): { start: number; end: number } => {
    const area = field.current;
    const prefix = markLength(raw);
    return {
      start: prefix + (area?.selectionStart ?? 0),
      end: prefix + (area?.selectionEnd ?? 0),
    };
  };
  const goTo = (target: number, atEnd: boolean): void => {
    const next = Math.max(0, Math.min(target, lines.length - 1));
    setActive(next);
    setRequest({ start: atEnd ? (lines[next] ?? '').length : 0, end: atEnd ? (lines[next] ?? '').length : 0 });
  };

  // Aplica uma edição pura à seleção da linha ativa e devolve o cursor ao lugar certo.
  const change = (run: (edit: { text: string; start: number; end: number }) => { text: string; start: number; end: number }): void => {
    const { start, end } = selection();
    const edit = run({ text: source, start: offsetOf(source, line, start), end: offsetOf(source, line, end) });
    write(edit.text);
    const from = locate(edit.text, edit.start);
    const to = locate(edit.text, edit.end);
    setActive(from.line);
    setRequest({ start: from.caret, end: to.line === from.line ? to.caret : from.caret });
  };

  return {
    mode,
    setMode,
    source,
    drafts,
    ready,
    saved,
    openId,
    setOpenId,
    field,
    imageField,
    replace: apply,
    refocus: () => goTo(line, true),
    line,
    activate: (target) => goTo(target, true),
    typeLine: (value, at) => {
      const prefix = markLength(raw);
      const swapped = symbolAtCaret(value, at);
      const text = swapped ? swapped.text : value;
      const caret = swapped ? swapped.caret : at;
      const next = [...lines];
      next[line] = raw.slice(0, prefix) + text;
      write(next.join('\n'));
      setRequest({ start: prefix + caret, end: prefix + caret });
    },
    save: () => {
      const complete = expandDrafts(drafts.filter(isComplete));
      if (complete.length === 0) return;
      const ids = complete.map(() => crypto.randomUUID());
      storage.write((data) => addCards(data, lessonId, complete, ids, today));
      const rest = keepIncomplete(drafts);
      setSource(rest);
      setSaved(complete.length);
      setActive(-1);
      setRequest({ start: Number.MAX_SAFE_INTEGER, end: Number.MAX_SAFE_INTEGER });
    },
    format: (kind) => change((edit) => formatCard(edit, kind)),
    cloze: (same) => change((edit) => insertCloze(edit, same)),
    newCard: () => {
      const next = appendCard(source);
      setMode('novo');
      write(next.source);
      setActive(splitLines(next.source).length - 1);
      setRequest({ start: Number.MAX_SAFE_INTEGER, end: Number.MAX_SAFE_INTEGER });
      dispatch({ type: 'jump', block: blockId, level: 'field' });
    },
    lineActions: {
      cardLineSplit: () => {
        const { start, end } = selection();
        apply(splitAt(source, line, start, end));
      },
      cardLineBack: () => {
        const edit = backspaceAtStart(source, line);
        if (edit) apply(edit);
      },
      cardLineMove: (delta) => goTo(line + delta, delta < 0),
    },
  };
}
