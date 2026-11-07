import { useState } from 'react';
import { createSession, type Session } from '../../../core/study/session';
import type { Card, StudyData } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { today, useStudy } from '../../study/study';
import { TrainingSession } from './TrainingSession';
import styles from './Treino.module.css';

const DECKS = 'treino.baralhos';
const SUMMARY = 'treino.resumo';

interface Deck {
  id: string;
  name: string;
  code: string;
  color: number;
  cards: Card[];
  due: Card[];
}

function decksOf(data: StudyData): Deck[] {
  return data.subjects.flatMap((subject) => {
    const lessons = data.lessons.filter((lesson) => lesson.subjectId === subject.id);
    const cards = data.cards.filter((card) => lessons.some((item) => item.id === card.lessonId));
    if (cards.length === 0) return [];
    const due = cards.filter((card) => card.due <= today);
    return [{ ...subject, cards, due }];
  });
}

export function Treino() {
  const data = useStudy();
  const [session, setSession] = useState<Session | null>(null);
  if (session) {
    return <TrainingSession session={session} onChange={setSession} />;
  }
  return <DeckList data={data} onStart={(ids) => setSession(createSession(ids))} />;
}

function DeckList({ data, onStart }: { data: StudyData; onStart: (ids: string[]) => void }) {
  const decks = decksOf(data);
  const index = useSelectedIndex(DECKS, decks.length);
  const deck = decks[index];
  const start = () => {
    if (deck && deck.due.length > 0) onStart(deck.due.map((card) => card.id));
  };

  useBlocks({
    blocks: [
      {
        id: DECKS,
        kind: 'nav',
        nav: { axis: 'y', count: decks.length },
        neighbors: { right: SUMMARY },
        onActivate: start,
      },
      {
        id: SUMMARY,
        kind: 'nav',
        nav: { axis: 'y', count: 1 },
        neighbors: { left: DECKS },
        onActivate: start,
      },
    ],
    arrival: { block: DECKS, level: 'nav' },
  });

  return (
    <ScreenFrame title="Treino">
      <div className={styles.colunas}>
        <Block id={DECKS} title="Baralhos" count={String(decks.length)}>
          <div className={styles.lista}>
            {decks.length === 0 && <p className={styles.vazio}>Crie cartões para treinar.</p>}
            {decks.map((item, position) => (
              <NavItem key={item.id} block={DECKS} index={position} className={styles.baralho}>
                <span className={styles.sigla} data-materia={item.color}>
                  {item.code}
                </span>
                <b className={styles.nome}>{item.name}</b>
                <span className={styles.vencidos}>{item.due.length} para hoje</span>
              </NavItem>
            ))}
          </div>
        </Block>
        <Block id={SUMMARY} title="Resumo">
          {deck && (
            <div className={styles.resumo}>
              <span className={styles.numero}>{deck.due.length}</span>
              <p className={styles.legenda}>
                cartões para hoje, de {deck.cards.length} em {deck.name}
              </p>
              <NavItem
                block={SUMMARY}
                index={0}
                className={styles.iniciar}
                ring="anel"
                onOpen={start}
              >
                {deck.due.length > 0 ? 'Iniciar treino' : 'Nada para hoje'}
                <kbd className={styles.teclaBotao}>Enter</kbd>
              </NavItem>
            </div>
          )}
        </Block>
      </div>
    </ScreenFrame>
  );
}
