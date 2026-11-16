import { useEffect } from 'react';
import { intervalLabel, preview } from '../../../core/study/fsrs';
import { parseStamp } from '../../../core/study/schedule';
import { flip, isFinished, rate, skip, type Grade, type Session } from '../../../core/study/session';
import { answerCard, nextDue, trainParams } from '../../../core/study/train';
import { imagesBySide } from '../../../core/study/cardImages';
import { Block } from '../../components/Block';
import { CardPicture, ImageZoom, type ImageSource } from '../../components/CardImages';
import { ClozeFace, Inline, StudyCard } from '../../components/CardBack';
import { NavItem } from '../../components/NavItem';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { hasCloze } from '../../../core/study/cloze';
import { useCardView } from '../../study/cardView';
import { openZoom, useCardImages, useZoom } from '../../study/cardImages';
import { storage, useStudy } from '../../study/study';
import { FsrsPanel } from './FsrsPanel';
import styles from './Treino.module.css';

const CARD = 'treino.cartao';

const GRADES: readonly [Grade, string][] = [
  [1, 'Errei'],
  [2, 'Difícil'],
  [3, 'Bom'],
  [4, 'Fácil'],
];

interface TrainingSessionProps {
  session: Session;
  scope: readonly string[];
  onChange: (session: Session | null) => void;
}

// Fim da sessão: quando volta o próximo cartão do recorte.
function nextLabel(due: string | null, now: Date): string {
  if (due === null) return 'Nenhum cartão no recorte.';
  const when = parseStamp(due);
  return when <= now ? 'Ainda há cartões vencidos no recorte.' : `Próximo cartão em ${intervalLabel(now, when)}.`;
}

// Pergunta longa encolhe a letra em dois degraus (140 e 360 letras), D150.
function sizeOf(text: string): 'p' | 'm' | 'g' {
  return text.length > 360 ? 'g' : text.length > 140 ? 'm' : 'p';
}

export function TrainingSession({ session, scope, onChange }: TrainingSessionProps) {
  const data = useStudy();
  const card = data.cards.find((item) => item.id === session.current);
  const finished = isFinished(session);
  const missing = !finished && card === undefined;
  useEffect(() => {
    if (missing) onChange(skip(session, new Date()));
  }, [missing, session, onChange]);
  const params = trainParams(data);
  const shownAt = new Date();
  const intervals = card && session.flipped ? preview(card, shownAt, params) : null;
  // Cartão e histórico numa escrita só; o flush grava na hora para recarregar sem perder (Etapa 11).
  const respond = (grade: Grade) => {
    if (!card || !session.flipped) return;
    const now = new Date();
    let due = card.due;
    storage.write((current) => {
      const next = answerCard(current, card.id, grade, now, trainParams(current), crypto.randomUUID());
      due = next.cards.find((item) => item.id === card.id)?.due ?? due;
      return next;
    });
    void storage.flush();
    onChange(rate(session, grade, due, now));
  };
  const question = card?.question ?? '';
  const answer = card?.answer ?? '';
  const cloze = hasCloze(question);
  const view = useCardView();
  const index = useCardImages();
  const zoom = useZoom();
  const sides = imagesBySide(answer, index.sideOf);
  // A da frente aparece na frente; as do verso só depois de virar (D158). Toque amplia.
  const visible = session.flipped ? [...sides.front, ...sides.back] : sides.front;
  const images: ImageSource = { ...index, onZoom: (id) => openZoom(visible, id) };
  const picture = (id: string, size: 'grande') => (
    <span key={id} onClick={(event) => event.stopPropagation()}>
      <CardPicture src={index.src(id)} side="frente" size={size} onZoom={() => images.onZoom?.(id)} />
    </span>
  );
  const leave = () => onChange(null);
  const turn = () => {
    if (!finished) onChange(flip(session));
  };

  useBlocks({
    blocks: [
      {
        id: CARD,
        kind: 'nav',
        nav: { axis: 'y', count: 1 },
        onActivate: finished ? leave : turn,
      },
    ],
    arrival: { block: CARD, level: 'nav' },
    back: leave,
    actions: {
      flipCard: turn,
      rateCard: (change) => {
        if (change.type === 'rateCard') respond(change.grade);
      },
    },
  });

  return (
    <ScreenFrame
      title="Treino"
      end={
        <span className={styles.progresso}>
          {session.done} de {session.total}
        </span>
      }
    >
      <Block id={CARD} className={styles.sessao}>
        {finished ? (
          <div className={styles.cartao}>
            <p className={styles.pergunta}>Treino concluído</p>
            <p className={styles.legenda}>
              {session.answers} {session.answers === 1 ? 'resposta' : 'respostas'}, {session.missed}{' '}
              {session.missed === 1 ? 'erro' : 'erros'}.{' '}
              {nextLabel(nextDue(data.cards.filter((item) => scope.includes(item.id))), new Date())}
            </p>
            <NavItem block={CARD} index={0} className={styles.iniciar} ring="anel" onOpen={leave}>
              Voltar à escolha <kbd className={styles.teclaBotao}>Enter</kbd>
            </NavItem>
          </div>
        ) : session.flipped ? (
          <div className={styles.palco}>
            <div className={styles.virado} data-cloze={cloze}>
              {cloze ? (
                <ClozeFace text={question} side="verso" />
              ) : (
                <StudyCard front={question} back={answer} colorTitles={view.colorTitles} images={images} />
              )}
            </div>
            <div className={styles.notas}>
              {GRADES.map(([grade, label]) => (
                <button
                  key={grade}
                  type="button"
                  className={styles.nota}
                  data-nota={grade}
                  onClick={() => respond(grade)}
                >
                  {label} <kbd className={styles.tecla}>{grade}</kbd>
                  {intervals && (
                    <span className={styles.intervalo}>{intervalLabel(shownAt, intervals[grade])}</span>
                  )}
                </button>
              ))}
            </div>
            {card && <FsrsPanel card={card} retention={params.retention} next={intervals} />}
          </div>
        ) : (
          <div className={styles.palco}>
            <NavItem block={CARD} index={0} className={styles.frenteCheia} ring="anel" onOpen={turn}>
              <span className={styles.rotulo}>Frente</span>
              <span className={styles.perguntaCheia} data-tam={sizeOf(question)} data-pergunta>
                <Inline text={question} cloze={cloze ? 'esconde' : undefined} />
              </span>
              {sides.front.map((id) => picture(id, 'grande'))}
              <span className={styles.dica}>Toque ou Espaço para revelar</span>
            </NavItem>
            {card && <FsrsPanel card={card} retention={params.retention} next={null} />}
          </div>
        )}
      </Block>
      <ImageZoom ids={zoom.ids} current={zoom.current} src={index.src} />
    </ScreenFrame>
  );
}
