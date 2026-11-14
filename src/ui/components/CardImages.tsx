import type { ReactNode } from 'react';
import { ListBox, ListBoxItem, Tag, TagGroup, TagList } from 'react-aria-components';
import { MAX_IMAGES, type SideOf } from '../../core/study/cardImages';
import type { ImageSide } from '../../core/study/types';
import { Window } from './Window';
import styles from './CardImages.module.css';

// De onde a peça tira as imagens: a tela passa o índice do banco (a peça não lê dados).
export interface ImageSource {
  sideOf: SideOf;
  src: (id: string) => string | undefined;
  onZoom?: (id: string) => void;
}

export const IMAGE_DRAWER = 'imagens-cartao';
export const IMAGE_ZOOM = 'imagem-ampliada';

const SIDE_NAME: Record<ImageSide, string> = { frente: 'frente', verso: 'verso' };

export function ImageIcon({ plus }: { plus?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {plus ? (
        <>
          <path d="M16 5h6M19 2v6" />
          <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
        </>
      ) : (
        <rect x="3" y="3" width="18" height="18" rx="2" />
      )}
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </svg>
  );
}

function Cross() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

const keepFocus = { onMouseDown: (event: React.MouseEvent) => event.preventDefault() };

interface ImageAttachProps {
  side: ImageSide;
  count: number;
  onAttach: () => void;
  onOpen: () => void;
}

// Sem imagem: ícone discreto de anexar. Com imagem: pílula com ícone e número, que abre a gaveta (D158).
export function ImageAttach({ side, count, onAttach, onOpen }: ImageAttachProps) {
  if (count === 0) {
    return (
      <button
        type="button"
        className={styles.anexar}
        data-lado={side}
        aria-label={`Anexar imagem na ${SIDE_NAME[side]}`}
        onClick={onAttach}
        {...keepFocus}
      >
        <ImageIcon plus />
      </button>
    );
  }
  return (
    <button
      type="button"
      className={styles.pilula}
      data-lado={side}
      aria-label={`${count} ${count === 1 ? 'imagem' : 'imagens'} na ${SIDE_NAME[side]}`}
      onClick={onOpen}
      {...keepFocus}
    >
      <ImageIcon />
      <b>{count}</b>
    </button>
  );
}

interface CardPictureProps {
  src: string | undefined;
  side: ImageSide;
  // Linha em edição: recebe o foco (Enter amplia, Delete remove, pela tabela de teclas).
  active?: boolean;
  focusRef?: React.Ref<HTMLDivElement>;
  onPress?: () => void;
  onZoom?: () => void;
  onRemove?: () => void;
  size?: 'linha' | 'grande' | 'mini';
}

// Imagem no ponto do texto onde foi colocada. Sem os bytes (apagada), mostra o lugar vazio.
export function CardPicture({
  src,
  side,
  active,
  focusRef,
  onPress,
  onZoom,
  onRemove,
  size = 'linha',
}: CardPictureProps) {
  return (
    <div className={styles.foto} data-lado={side} data-tam={size} data-ativa={active || undefined}>
      <div
        ref={focusRef}
        className={styles.moldura}
        tabIndex={active ? 0 : -1}
        data-card-image={active ? '' : undefined}
        data-field={active ? '' : undefined}
        aria-label={active ? 'Imagem do cartão: Enter amplia, Delete remove' : undefined}
        onClick={active || !onPress ? onZoom : onPress}
      >
        {src ? (
          <img src={src} alt="" draggable={false} />
        ) : (
          <span className={styles.semImagem}>Imagem indisponível</span>
        )}
        {onRemove && (
          <button
            type="button"
            className={styles.tirar}
            aria-label="Remover imagem"
            onClick={(event) => (event.stopPropagation(), onRemove())}
            {...keepFocus}
          >
            <Cross />
          </button>
        )}
      </div>
    </div>
  );
}

interface ImageDrawerProps {
  side: ImageSide;
  ids: readonly string[];
  context: string;
  source: ImageSource;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

// A janela abre com o foco na caixa; a gaveta põe na primeira miniatura (e de novo se a escolhida sair).
function focusFirst(element: HTMLDivElement | null): void {
  if (!element || element.contains(document.activeElement)) return;
  requestAnimationFrame(() => element.querySelector<HTMLElement>('[role="row"]')?.focus());
}

// Gaveta: só gerencia (← → andam, Enter amplia, Delete remove, Esc fecha).
export function ImageDrawer({ side, ids, context, source, onRemove, onAdd }: ImageDrawerProps) {
  const add = '__adicionar';
  return (
    <Window
      id={IMAGE_DRAWER}
      context={context}
      title={`Imagens ${side === 'frente' ? 'da frente' : 'do verso'}`}
    >
      <p className={styles.conta}>
        {ids.length} de {MAX_IMAGES}
      </p>
      <div ref={focusFirst} className={styles.gaveta}>
      <TagGroup
        aria-label={`Imagens ${side === 'frente' ? 'da frente' : 'do verso'}`}
        onRemove={(keys) => [...keys].forEach((key) => key !== add && onRemove(String(key)))}
      >
        <TagList className={styles.minis}>
          {[
            ...ids.map((id) => (
              <Tag
                key={id}
                id={id}
                textValue="Imagem"
                className={styles.mini}
                onAction={() => source.onZoom?.(id)}
              >
                {source.src(id) ? (
                  <img src={source.src(id)} alt="" />
                ) : (
                  <span className={styles.semImagem}>?</span>
                )}
                <button
                  type="button"
                  slot="remove"
                  className={styles.tirar}
                  aria-label="Remover imagem"
                >
                  <Cross />
                </button>
              </Tag>
            )),
            ids.length < MAX_IMAGES ? (
              <Tag
                key={add}
                id={add}
                textValue="Adicionar"
                className={styles.adicionar}
                onAction={onAdd}
              >
                <ImageIcon plus />
                Adicionar
              </Tag>
            ) : null,
          ].filter((item): item is NonNullable<typeof item> => item !== null)}
        </TagList>
      </TagGroup>
      </div>
    </Window>
  );
}

interface ImageZoomProps {
  ids: readonly string[];
  current: string | null;
  src: (id: string) => string | undefined;
}

// Ampliada: ← → trocam de imagem (a lista rola até a escolhida), Esc fecha.
export function ImageZoom({ ids, current, src }: ImageZoomProps): ReactNode {
  return (
    <Window id={IMAGE_ZOOM} title="Imagem" wide>
      <ListBox
        aria-label="Imagens do cartão"
        orientation="horizontal"
        layout="stack"
        className={styles.ampla}
        autoFocus={false}
        defaultSelectedKeys={current ? [current] : []}
        selectionMode="single"
        disallowEmptySelection
        ref={(element) => {
          if (!element || element.contains(document.activeElement)) return;
          const at = Math.max(0, ids.indexOf(current ?? ''));
          requestAnimationFrame(() => element.querySelectorAll<HTMLElement>('[role="option"]')[at]?.focus());
        }}
      >
        {ids.map((id, index) => (
          <ListBoxItem
            key={id}
            id={id}
            textValue={`Imagem ${index + 1} de ${ids.length}`}
            className={styles.amplaItem}
          >
            {src(id) ? (
              <img src={src(id)} alt="" />
            ) : (
              <span className={styles.semImagem}>Imagem indisponível</span>
            )}
            {ids.length > 1 && (
              <span className={styles.posicao}>
                {index + 1} de {ids.length}
              </span>
            )}
          </ListBoxItem>
        ))}
      </ListBox>
    </Window>
  );
}
