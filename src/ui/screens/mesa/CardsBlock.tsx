import { useEffect, useRef, useState } from 'react';
import {
  appendCard,
  isComplete,
  keepIncomplete,
  parseDrafts,
  type Draft,
} from '../../../core/study/cardText';
import { addCards } from '../../../core/study/create';
import type { Card } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { CardBack, Inline } from '../../components/CardBack';
import { NavItem } from '../../components/NavItem';
import { dispatch } from '../../keyboard/store';
import { useScreenMemory } from '../../study/screenMemory';
import { storage, today } from '../../study/study';
import styles from './CardsBlock.module.css';

export type CardsMode = 'novo' | 'salvos';

const CARD_COLORS = ['roxo', 'rosa', 'azul', 'verde'];
const HINT = '@ frente · # seção · - item · 1. número · + a favor · -- contra · ? dúvida';

export interface CardsEditor {
  mode: CardsMode;
  setMode: (mode: CardsMode) => void;
  source: string;
  setSource: (source: string) => void;
  drafts: Draft[];
  ready: number;
  saved: number | null;
  save: () => void;
  newCard: () => void;
  field: React.RefObject<HTMLTextAreaElement | null>;
}

// O rascunho fica na memória da tela, por aula, até salvar (não sobrevive a fechar o app).
export function useCardsEditor(blockId: string, lessonId: string): CardsEditor {
  const [mode, setMode] = useScreenMemory<CardsMode>('mesa.cartoes.modo', 'novo');
  const [source, setSource] = useScreenMemory(`mesa.cartoes.rascunho.${lessonId}`, '');
  const [saved, setSaved] = useState<number | null>(null);
  const [caret, setCaret] = useState<number | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const drafts = parseDrafts(source);
  const ready = drafts.filter(isComplete).length;

  useEffect(() => {
    if (caret === null || !field.current) return;
    field.current.setSelectionRange(caret, caret);
    setCaret(null);
  }, [caret]);

  return {
    mode,
    setMode,
    source,
    setSource: (next) => {
      setSaved(null);
      setSource(next);
    },
    drafts,
    ready,
    saved,
    field,
    save: () => {
      const complete = drafts.filter(isComplete);
      if (complete.length === 0) return;
      const ids = complete.map(() => crypto.randomUUID());
      storage.write((data) => addCards(data, lessonId, complete, ids, today));
      const rest = keepIncomplete(drafts);
      setSource(rest);
      setSaved(complete.length);
      setCaret(rest.length);
    },
    newCard: () => {
      const next = appendCard(source);
      setMode('novo');
      setSaved(null);
      setSource(next.source);
      setCaret(next.caret);
      dispatch({ type: 'jump', block: blockId, level: 'field' });
    },
  };
}

interface CardsBlockProps {
  id: string;
  cards: readonly Card[];
  editor: CardsEditor;
}

export function CardsBlock({ id, cards, editor }: CardsBlockProps) {
  const { mode, setMode } = editor;
  const tabs = (
    <div className={styles.abas} role="group" aria-label="Cartões">
      <button
        type="button"
        className={styles.aba}
        data-sel={mode === 'novo'}
        onClick={() => setMode('novo')}
      >
        Novo
      </button>
      <button
        type="button"
        className={styles.aba}
        data-sel={mode === 'salvos'}
        onClick={() => setMode('salvos')}
      >
        Salvos {cards.length}
      </button>
    </div>
  );
  return (
    <Block id={id} title="Cartões" icon="cartoes" tools={tabs} shortcut="Alt C" menu>
      {mode === 'novo' ? <Writer editor={editor} /> : <Saved id={id} cards={cards} />}
    </Block>
  );
}

function Writer({ editor }: { editor: CardsEditor }) {
  const { source, setSource, drafts, ready, saved, save, field } = editor;
  return (
    <div className={styles.criar}>
      <div className={styles.criarGrade}>
        <textarea
          ref={field}
          data-field
          className={styles.texto}
          value={source}
          spellCheck
          aria-label="Texto dos cartões"
          placeholder={
            '@ Quem libera IL-6?\nMacrófago ativado\n# Efeitos\n- Febre\n- ↑ PCR no fígado'
          }
          onChange={(event) => setSource(event.target.value)}
        />
        <div className={styles.rascunhos} aria-label="Prévia">
          {drafts.length === 0 && (
            <p className={styles.vazio}>A prévia dos cartões aparece aqui.</p>
          )}
          {drafts.map((draft, index) => (
            <article key={index} className={styles.rascunho} data-incompleto={!isComplete(draft)}>
              <p className={styles.frente}>
                {draft.front ? <Inline text={draft.front} /> : 'Sem frente'}
              </p>
              {draft.back ? (
                <CardBack back={draft.back} compact />
              ) : (
                <p className={styles.falta}>Falta o verso</p>
              )}
            </article>
          ))}
        </div>
      </div>
      <footer className={styles.rodape}>
        <p className={styles.dica}>
          {saved !== null ? `${saved} ${saved === 1 ? 'cartão salvo' : 'cartões salvos'}.` : HINT}
        </p>
        <button
          type="button"
          className={styles.salvar}
          disabled={ready === 0}
          onPointerDown={(event) => event.preventDefault()}
          onClick={save}
        >
          Salvar {ready > 0 ? ready : ''} <kbd className={styles.teclaSalvar}>Ctrl Enter</kbd>
        </button>
      </footer>
    </div>
  );
}

function Saved({ id, cards }: { id: string; cards: readonly Card[] }) {
  return (
    <div className={styles.cartoes}>
      {cards.length === 0 && <p className={styles.vazio}>Sem cartões nesta aula. Alt N cria.</p>}
      {cards.map(({ id: cardId, question, answer }, index) => (
        <NavItem
          key={cardId}
          block={id}
          index={index}
          className={styles.cartao}
          color={CARD_COLORS[index % CARD_COLORS.length]}
        >
          <span className={styles.pergunta}>
            <Inline text={question} />
          </span>
          <CardBack back={answer} compact />
        </NavItem>
      ))}
    </div>
  );
}
