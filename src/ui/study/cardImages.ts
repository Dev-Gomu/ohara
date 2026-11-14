import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { MAX_IMAGES, scaleTo, sideMap, type SideOf } from '../../core/study/cardImages';
import type { CardImage, ImageSide } from '../../core/study/types';
import { IMAGE_DRAWER, IMAGE_ZOOM } from '../components/CardImages';
import { dispatch, useKeyboardState } from '../keyboard/store';
import { showNotice } from './notice';
import { storage, useStudy } from './study';

const QUALITY = 0.85;

export const isImageFile = (file: File): boolean => file.type.startsWith('image/');

// Reduz no navegador (lado maior de 1600 px) e guarda como JPEG: cabe no banco e no backup (D158).
function reduce(file: File): Promise<Omit<CardImage, 'id' | 'lessonId' | 'side'>> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const size = scaleTo(image.naturalWidth, image.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext('2d');
      URL.revokeObjectURL(url);
      if (!context) return reject(new Error('Sem canvas'));
      // Fundo branco: PNG transparente não fica preto no JPEG.
      context.fillStyle = '#fff'; // lint-visual-ok: fundo do arquivo da imagem, não da tela
      context.fillRect(0, 0, size.width, size.height);
      context.drawImage(image, 0, 0, size.width, size.height);
      resolve({ mime: 'image/jpeg', ...size, data: canvas.toDataURL('image/jpeg', QUALITY) });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Arquivo não é imagem'));
    };
    image.src = url;
  });
}

// Grava as imagens e devolve os ids, na ordem; o limite é por lado do cartão.
export async function addImages(
  files: readonly File[],
  lessonId: string,
  side: ImageSide,
  already: number,
): Promise<string[]> {
  const images = files.filter(isImageFile);
  if (images.length === 0) {
    if (files.length > 0) showNotice('Só imagens podem ser anexadas ao cartão.');
    return [];
  }
  const room = Math.max(0, MAX_IMAGES - already);
  const accepted = images.slice(0, room);
  if (accepted.length < images.length) {
    showNotice(`Máximo de ${MAX_IMAGES} imagens por lado do cartão.`);
  }
  const made: CardImage[] = [];
  for (const file of accepted) {
    try {
      made.push({ id: crypto.randomUUID(), lessonId, side, ...(await reduce(file)) });
    } catch {
      showNotice('Um dos arquivos não pôde ser lido como imagem.');
    }
  }
  if (made.length > 0)
    storage.write((data) => ({ ...data, cardImages: [...data.cardImages, ...made] }));
  return made.map((image) => image.id);
}

// Exclusão lógica no banco (a coleção perde o item e o diff marca deleted).
export function removeImages(ids: readonly string[]): void {
  if (ids.length === 0) return;
  const gone = new Set(ids);
  storage.write((data) => ({
    ...data,
    cardImages: data.cardImages.filter((image) => !gone.has(image.id)),
  }));
}

export interface ImageIndex {
  sideOf: SideOf;
  src: (id: string) => string | undefined;
}

export function useCardImages(): ImageIndex {
  const { cardImages } = useStudy();
  return useMemo(() => {
    const byId = new Map(cardImages.map((image) => [image.id, image.data]));
    return { sideOf: sideMap(cardImages), src: (id) => byId.get(id) };
  }, [cardImages]);
}

// O seletor só abre a partir de um gesto do usuário: Enter no menu conta como gesto.
export function pickImages(onPick: (files: File[]) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.addEventListener('change', () => onPick([...(input.files ?? [])]));
  input.click();
}

// Imagem ampliada: qual lista e qual imagem; "fromDrawer" faz o Esc voltar à gaveta (D158).
interface ZoomState {
  ids: readonly string[];
  current: string | null;
  fromDrawer: boolean;
}

let zoom: ZoomState = { ids: [], current: null, fromDrawer: false };
const zoomListeners = new Set<() => void>();

export function openZoom(ids: readonly string[], current: string, fromDrawer = false): void {
  zoom = { ids, current, fromDrawer };
  zoomListeners.forEach((listener) => listener());
  dispatch({ type: 'openWindow', window: IMAGE_ZOOM });
}

export function useZoom(): ZoomState {
  return useSyncExternalStore(
    (listener) => {
      zoomListeners.add(listener);
      return () => zoomListeners.delete(listener);
    },
    () => zoom,
  );
}

// Ao fechar a ampliada que veio da gaveta, a gaveta volta; ao fechar a gaveta, o foco volta ao cartão.
export function useImageWindows(onClosed: () => void): void {
  const { focus } = useKeyboardState();
  const previous = useRef(focus.window);
  useEffect(() => {
    const before = previous.current;
    previous.current = focus.window;
    if (focus.window !== null) return;
    if (before === IMAGE_ZOOM && zoom.fromDrawer) dispatch({ type: 'openWindow', window: IMAGE_DRAWER });
    else if (before === IMAGE_ZOOM || before === IMAGE_DRAWER) onClosed();
  });
}
