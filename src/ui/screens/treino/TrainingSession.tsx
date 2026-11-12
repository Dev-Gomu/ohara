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

export function TrainingSession({ session, onChange }: TrainingSessionProps) {
  const data = useStudy();
  const card = data.cards.find((item) => item.id === session.queue[0]);
  const finished = isFinished(session);
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
        ) : (
          <div className={styles.cartao}>
            <p className={styles.pergunta}>
              <Inline text={card?.question ?? ''} />
            </p>
            {session.flipped && (
              <div className={styles.resposta}>
                <CardBack back={card?.answer ?? ''} />
              </div>
            )}
            {session.flipped ? (
              <div className={styles.notas}>
                {GRADES.map(([grade, label]) => (
                  <button
                    key={grade}
                    type="button"
                    className={styles.nota}
                    onClick={() => onChange(rate(session, grade))}
                  >
                    {label} <kbd className={styles.tecla}>{grade}</kbd>
                  </button>
                ))}
              </div>
            ) : (
              <NavItem block={CARD} index={0} className={styles.iniciar} ring="anel" onOpen={turn}>
                Ver resposta <kbd className={styles.teclaBotao}>Espaço</kbd>
              </NavItem>
            )}
          </div>
        )}
      </Block>
    </ScreenFrame>
  );
}
