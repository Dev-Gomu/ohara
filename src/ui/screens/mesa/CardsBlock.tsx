import { imagesBySide } from '../../../core/study/cardImages';
import { hasCloze } from '../../../core/study/cloze';
import { backPreview } from '../../../core/study/cardText';
import type { Card } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { Button } from '../../components/Button';
import { Inline, StudyCard } from '../../components/CardBack';
import { NavItem } from '../../components/NavItem';
import { useCardView } from '../../study/cardView';
import { BlockTab, BlockTabs } from '../../components/Toggles';
import { ImageDrawer, ImageZoom } from '../../components/CardImages';
import { openZoom, useZoom } from '../../study/cardImages';
import { CardEditor } from './CardEditor';
import type { CardImagesEditor } from './useCardImagesEditor';
import styles from './CardsBlock.module.css';
import type { CardsEditor } from './useCardsEditor';

interface CardsBlockProps {
  id: string;
  cards: readonly Card[];
  editor: CardsEditor;
  images: CardImagesEditor;
}

export function CardsBlock({ id, cards, editor, images }: CardsBlockProps) {
  const zoom = useZoom();
  const { mode, setMode, ready, save } = editor;
  const tabs = (
    <BlockTabs label="Cartões">
      <BlockTab selected={mode === 'novo'} onPress={() => setMode('novo')}>
        Novo
      </BlockTab>
      <BlockTab selected={mode === 'salvos'} count={cards.length} onPress={() => setMode('salvos')}>
        Salvos
      </BlockTab>
    </BlockTabs>
  );
  // Salvar fica no cabeçalho, ao lado do ⋮ (D140); sem rodapé, a área de digitação ganha a altura.
  const tools = (
    <>
      {tabs}
      {mode === 'novo' && (
        <span
          className={styles.salvar}
          data-bar="bottom"
          onPointerDown={(event) => event.preventDefault()}
        >
          <Button variant="primary" shortcut="Ctrl Enter" disabled={ready === 0} onPress={save}>
            {ready > 0 ? `Salvar ${ready}` : 'Salvar'}
          </Button>
        </span>
      )}
    </>
  );
  return (
    <Block id={id} title="Cartões" icon="cartoes" tools={tools} shortcut="Alt C" menu>
      {mode === 'novo' ? (
        <CardEditor editor={editor} images={images} />
      ) : (
        <Saved id={id} cards={cards} editor={editor} images={images} />
      )}
      {images.drawer && (
        <ImageDrawer
          side={images.drawer.side}
          ids={images.drawerIds}
          context="Cartões"
          source={{ ...images.source, onZoom: (image) => openZoom(images.drawerIds, image, true) }}
          onRemove={images.removeId}
          onAdd={() => images.drawer && images.pick(images.drawer.line, images.drawer.side)}
        />
      )}
      <ImageZoom ids={zoom.ids} current={zoom.current} src={images.source.src} />
    </Block>
  );
}

interface SavedProps {
  id: string;
  cards: readonly Card[];
  editor: CardsEditor;
  images: CardImagesEditor;
}

function Saved({ id, cards, editor, images }: SavedProps) {
  const { openId, setOpenId } = editor;
  const view = useCardView();
  if (cards.length === 0) return <p className={styles.vazio}>Sem cartões nesta aula. Alt N cria.</p>;
  return (
    <ol className={styles.lista}>
      {cards.map(({ id: cardId, question, answer }, index) => {
        const toggle = () => setOpenId(openId === cardId ? null : cardId);
        return (
          <li key={cardId}>
            <NavItem
              block={id}
              index={index}
              ring="cursor"
              className={openId === cardId ? styles.aberto : styles.linhaSalva}
              onOpen={toggle}
            >
              {openId === cardId ? (
                <StudyCard
                  front={question}
                  back={answer}
                  compact={view.compact}
                  colorTitles={view.colorTitles}
                  images={{
                    ...images.source,
                    onZoom: (image) => openZoom(imageList(answer, images), image),
                  }}
                />
              ) : (
                <>
                  <span className={styles.numero}>{index + 1}</span>
                  <span className={styles.textoSalvo}>
                    <span className={styles.pergunta}>
                      <Inline text={question} cloze="esconde" />
                    </span>
                    <span className={styles.comeco}>
                      {hasCloze(question) ? (
                        <Inline text={question} cloze="revela" />
                      ) : (
                        <Inline text={backPreview(answer)} />
                      )}
                    </span>
                  </span>
                </>
              )}
            </NavItem>
          </li>
        );
      })}
    </ol>
  );
}

// Na lista de salvos, a ampliada percorre as imagens do cartão aberto (frente e verso).
function imageList(answer: string, images: CardImagesEditor): string[] {
  const sides = imagesBySide(answer, images.source.sideOf);
  return [...sides.front, ...sides.back];
}
