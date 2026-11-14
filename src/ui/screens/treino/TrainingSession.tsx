import { flip, isFinished, rate, type Grade, type Session } from '../../../core/study/session';
import { Block } from '../../components/Block';
import { CardBack, Inline } from '../../components/CardBack';
import { NavItem } from '../../components/NavItem';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { useStudy } from '../../study/study';
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
  onChange: (session: Session | null) => void;
}

// Pergunta longa encolhe a letra em dois degraus (140 e 360 letras), D150.
function sizeOf(text: string): 'p' | 'm' | 'g' {
  return text.length > 360 ? 'g' : text.length > 140 ? 'm' : 'p';
}

export function TrainingSession({ session, onChange }: TrainingSessionProps) {
  const data = useStudy();
  const card = data.cards.find((item) => item.id === session.queue[0]);
  const finished = isFinished(session);
  const question = card?.question ?? '';
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
        if (change.type === 'rateCard') onChange(rate(session, change.grade));
      },
    },
  });

  return (
    <ScreenFrame
      title="Treino"
      end={
        <span className={styles.progresso}>
          {session.answered} de {session.total}
        </span>
      }
    >
      <Block id={CARD} className={styles.sessao}>
        {finished ? (
          <div className={styles.cartao}>
            <p className={styles.pergunta}>Treino concluído</p>
            <p className={styles.legenda}>
              {session.answered} cartões revisados, {session.missed} erros no caminho.
            </p>
            <NavItem block={CARD} index={0} className={styles.iniciar} ring="anel" onOpen={leave}>
              Voltar à escolha <kbd className={styles.teclaBotao}>Enter</kbd>
            </NavItem>
          </div>
        ) : session.flipped ? (
          <div className={styles.palco}>
            <div className={styles.topo} data-tam={sizeOf(question)}>
              <span className={styles.rotulo}>Frente</span>
              <span data-pergunta>
                <Inline text={question} />
              </span>
            </div>
            <div className={styles.versoCartao}>
              <span className={styles.rotuloVerso}>Verso</span>
              <CardBack back={card?.answer ?? ''} />
            </div>
            <div className={styles.notas}>
              {GRADES.map(([grade, label]) => (
                <button
                  key={grade}
                  type="button"
                  className={styles.nota}
                  data-nota={grade}
                  onClick={() => onChange(rate(session, grade))}
                >
                  {label} <kbd className={styles.tecla}>{grade}</kbd>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.palco}>
            <NavItem block={CARD} index={0} className={styles.frenteCheia} ring="anel" onOpen={turn}>
              <span className={styles.rotulo}>Frente</span>
              <span className={styles.perguntaCheia} data-tam={sizeOf(question)} data-pergunta>
                <Inline text={question} />
              </span>
              <span className={styles.dica}>Toque ou Espaço para revelar</span>
            </NavItem>
          </div>
        )}
      </Block>
    </ScreenFrame>
  );
}
