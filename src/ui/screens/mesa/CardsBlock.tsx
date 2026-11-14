import { useEffect, useRef, useState } from 'react';
import {
  appendCard,
  backPreview,
  isComplete,
  keepIncomplete,
  parseDrafts,
  type Draft,
} from '../../../core/study/cardText';
import { formatCard, type CardFormat } from '../../../core/study/cardFormat';
import { symbolAtCaret } from '../../../core/study/symbols';
import { addCards } from '../../../core/study/create';
import type { Card } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { Button } from '../../components/Button';
import { Inline, StudyCard } from '../../components/CardBack';
import { NavItem } from '../../components/NavItem';
import { dispatch } from '../../keyboard/store';
import { useScreenMemory } from '../../study/screenMemory';
import { useCardView } from '../../study/cardView';
import { storage, today } from '../../study/study';
import { BlockTab, BlockTabs } from '../../components/Toggles';
import styles from './CardsBlock.module.css';

export type CardsMode = 'novo' | 'salvos';

const HINT = '@ frente · # seção · ## subtítulo · - item · 1. número · + a favor · -- contra · ? dúvida';

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
  // Cartão aberto no lugar da linha, na lista de salvos (D151).
  openId: string | null;
  setOpenId: (id: string | null) => void;
  format: (format: CardFormat) => void;
  // Troca "->" e afins por símbolos logo ao digitar.
  type: (text: string, caret: number) => void;
  field: React.RefObject<HTMLTextAreaElement | null>;
}

// O rascunho fica na memória da tela, por aula, até salvar (não sobrevive a fechar o app).
export function useCardsEditor(blockId: string, lessonId: string): CardsEditor {
  const [mode, setMode] = useScreenMemory<CardsMode>('mesa.cartoes.modo', 'novo');
  const [source, setSource] = useScreenMemory(`mesa.cartoes.rascunho.${lessonId}`, '');
  const [caret, setCaret] = useState<{ start: number; end: number } | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const drafts = parseDrafts(source);
  const ready = drafts.filter(isComplete).length;

  useEffect(() => {
    if (caret === null || !field.current) return;
    field.current.setSelectionRange(caret.start, caret.end);
    setCaret(null);
  }, [caret]);

  return {
    mode,
    setMode,
    source,
    setSource: (next) => {
      setSource(next);
      setSaved(null);
    },
    drafts,
    ready,
    saved,
    openId,
    setOpenId,
    field,
    save: () => {
      const complete = drafts.filter(isComplete);
      if (complete.length === 0) return;
      const ids = complete.map(() => crypto.randomUUID());
      storage.write((data) => addCards(data, lessonId, complete, ids, today));
      const rest = keepIncomplete(drafts);
      setSource(rest);
      setSaved(complete.length);
      setCaret({ start: rest.length, end: rest.length });
    },
    format: (kind) => {
      const area = field.current;
      if (!area) return;
      const edit = formatCard(
        { text: area.value, start: area.selectionStart, end: area.selectionEnd },
        kind,
      );
      setSource(edit.text);
      setCaret({ start: edit.start, end: edit.end });
    },
    type: (text, at) => {
      const swapped = symbolAtCaret(text, at);
      setSource(swapped ? swapped.text : text);
      if (swapped) setCaret({ start: swapped.caret, end: swapped.caret });
    },
    newCard: () => {
      const next = appendCard(source);
      setMode('novo');
      setSource(next.source);
      setSaved(null);
      setCaret({ start: next.caret, end: next.caret });
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
      {mode === 'novo' ? <Writer editor={editor} /> : <Saved id={id} cards={cards} editor={editor} />}
    </Block>
  );
}

function Writer({ editor }: { editor: CardsEditor }) {
  const { source, type, drafts, saved, field } = editor;
  const view = useCardView();
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
          onChange={(event) => type(event.target.value, event.target.selectionStart)}
        />
        <div className={styles.rascunhos} aria-label="Prévia">
          {saved !== null && (
            <p className={styles.salvou}>
              {saved} {saved === 1 ? 'cartão salvo' : 'cartões salvos'}.
            </p>
          )}
          {drafts.length === 0 && (
            <p className={styles.vazio}>
              A prévia dos cartões aparece aqui. {HINT}
            </p>
          )}
          {drafts.map((draft, index) => (
            <StudyCard
              key={index}
              front={draft.front}
              back={draft.back}
              compact={view.compact}
              colorTitles={view.colorTitles}
              incomplete={!isComplete(draft)}
            />
          ))}
        </div>
      </div>
    </div>
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
