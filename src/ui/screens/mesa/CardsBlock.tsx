import {
  backPreview,
} from '../../../core/study/cardText';
import type { Card } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { Button } from '../../components/Button';
import { Inline, StudyCard } from '../../components/CardBack';
import { NavItem } from '../../components/NavItem';
import { useCardView } from '../../study/cardView';
import { BlockTab, BlockTabs } from '../../components/Toggles';
import { CardEditor } from './CardEditor';
import styles from './CardsBlock.module.css';
import type { CardsEditor } from './useCardsEditor';

interface CardsBlockProps {
  id: string;
  cards: readonly Card[];
  editor: CardsEditor;
}

export function CardsBlock({ id, cards, editor }: CardsBlockProps) {
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
      {mode === 'novo' ? <CardEditor editor={editor} /> : <Saved id={id} cards={cards} editor={editor} />}
    </Block>
  );
}

function Saved({ id, cards, editor }: { id: string; cards: readonly Card[]; editor: CardsEditor }) {
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
                />
              ) : (
                <>
                  <span className={styles.numero}>{index + 1}</span>
                  <span className={styles.textoSalvo}>
                    <span className={styles.pergunta}>
                      <Inline text={question} />
                    </span>
                    <span className={styles.comeco}>
                      <Inline text={backPreview(answer)} />
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
