import { useState } from 'react';
import {
  countSide,
  groupOf,
  imageIdOf,
  imagesBySide,
  insertImages,
  lineOfImage,
  removeImageLine,
  sideAt,
} from '../../../core/study/cardImages';
import { splitLines } from '../../../core/study/cardLines';
import type { ImageSide } from '../../../core/study/types';
import { IMAGE_DRAWER, type ImageSource } from '../../components/CardImages';
import type { BlockOption } from '../../keyboard/store';
import { dispatch } from '../../keyboard/store';
import {
  addImages,
  isImageFile,
  openZoom,
  pickImages,
  removeImages,
  useCardImages,
  useImageWindows,
} from '../../study/cardImages';
import type { CardsEditor } from './useCardsEditor';

export interface Drawer {
  line: number;
  side: ImageSide;
}

export interface CardImagesEditor {
  source: ImageSource;
  drawer: Drawer | null;
  drawerIds: string[];
  // Anexa no cartão da linha; sem lado, decide pela linha (pergunta ou imagem da frente: frente).
  attach: (files: readonly File[], line: number, side?: ImageSide) => void;
  pick: (line: number, side?: ImageSide) => void;
  openDrawer: (line: number, side: ImageSide) => void;
  removeAt: (line: number) => void;
  removeId: (id: string) => void;
  zoomAt: (line: number) => void;
  sidesOf: (line: number) => { front: string[]; back: string[] };
  onPaste: (event: React.ClipboardEvent) => void;
  dropOn: (line: number) => {
    onDragOver: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  };
  options: () => BlockOption[];
}

const filesOf = (list: FileList | null | undefined): File[] =>
  [...(list ?? [])].filter(isImageFile);

export function useCardImagesEditor(editor: CardsEditor, lessonId: string): CardImagesEditor {
  const index = useCardImages();
  const [drawer, setDrawer] = useState<Drawer | null>(null);
  const { source: text, line } = editor;
  useImageWindows(editor.refocus);

  const groupText = (at: number): string => {
    const lines = splitLines(text);
    return groupOf(text, at)
      .map((item) => lines[item] ?? '')
      .join('\n');
  };
  const sidesOf = (at: number) => imagesBySide(groupText(at), index.sideOf);
  const allIds = (at: number): string[] => {
    const sides = sidesOf(at);
    return [...sides.front, ...sides.back];
  };
  const drawerIds = drawer ? sidesOf(drawer.line)[drawer.side === 'frente' ? 'front' : 'back'] : [];

  // Botão (toque ou mouse) num cartão: se o cursor está nesse cartão, a imagem entra onde ele está.
  const anchor = (at: number): { at: number; atCursor: boolean } =>
    groupOf(text, at).includes(line) ? { at: line, atCursor: true } : { at, atCursor: false };

  const attach = (files: readonly File[], at: number, side?: ImageSide, atCursor = side === undefined): void => {
    const chosen = side ?? sideAt(text, at, index.sideOf);
    const already = countSide(text, at, chosen, index.sideOf);
    void addImages(files, lessonId, chosen, already).then((ids) => {
      if (ids.length === 0) return;
      // As imagens novas ainda não estão no índice: o lado delas é o escolhido.
      const known = new Set(ids);
      const sideOf = (id: string) => (known.has(id) ? chosen : index.sideOf(id));
      editor.replace(insertImages(editor.source, at, ids, chosen, sideOf, atCursor));
    });
  };

  const removeId = (id: string): void => {
    const at = lineOfImage(text, id);
    if (at >= 0) editor.replace(removeImageLine(text, at));
    removeImages([id]);
  };

  const source: ImageSource = {
    ...index,
    onZoom: (id) => openZoom(allIds(lineOfImage(text, id)), id),
  };

  return {
    source,
    drawer,
    drawerIds,
    attach,
    pick: (at, side) => {
      const place = anchor(at);
      pickImages((files) => attach(files, place.at, side, place.atCursor));
    },
    openDrawer: openDrawerAt,
    removeAt: (at) => {
      const id = imageIdOf(splitLines(text)[at] ?? '');
      if (id) removeId(id);
    },
    removeId,
    zoomAt: (at) => {
      const id = imageIdOf(splitLines(text)[at] ?? '');
      if (id) openZoom(allIds(at), id);
    },
    sidesOf,
    onPaste: (event) => {
      const files = filesOf(event.clipboardData.files);
      if (files.length === 0) return;
      event.preventDefault();
      attach(files, line);
    },
    dropOn: (at) => ({
      onDragOver: (event) => event.preventDefault(),
      onDrop: (event) => {
        event.preventDefault();
        event.stopPropagation();
        attach(filesOf(event.dataTransfer.files), at);
      },
    }),
    options: () => {
      const sides = sidesOf(line);
      return [
        {
          id: 'anexar-imagem',
          label: 'Anexar imagem…',
          run: () => pickImages((files) => attach(files, line)),
        },
        ...(sides.front.length > 0
          ? [
              {
                id: 'imagens-frente',
                label: `Ver imagens da frente (${sides.front.length})`,
                run: () => openDrawerAt(line, 'frente'),
              },
            ]
          : []),
        ...(sides.back.length > 0
          ? [
              {
                id: 'imagens-verso',
                label: `Ver imagens do verso (${sides.back.length})`,
                run: () => openDrawerAt(line, 'verso'),
              },
            ]
          : []),
      ];
    },
  };

  function openDrawerAt(at: number, side: ImageSide): void {
    setDrawer({ line: groupOf(text, at)[0] ?? at, side });
    dispatch({ type: 'openWindow', window: IMAGE_DRAWER });
  }
}
