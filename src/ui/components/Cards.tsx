import { Target, type TargetProps } from './Target';
import styles from './Cards.module.css';

export interface DayBrick {
  code: string;
  color: number;
  // Texto do app, já pronto: "prova", "trabalho", "apres.".
  kind: string;
}

interface AssessmentDayCardProps extends TargetProps {
  // Texto do app, já pronto: "TER 17" e "em 7 d".
  when: string;
  due: string;
  // O dia mais próximo: a contagem vira pílula cheia de ação.
  next?: boolean;
  bricks: readonly DayBrick[];
}

// Dia de avaliação: um bloquinho na cor da matéria para cada prova ou trabalho.
// A altura é fixa; a peça alarga com a quantidade de bloquinhos.
export function AssessmentDayCard({ when, due, next, bricks, ...target }: AssessmentDayCardProps) {
  return (
    <Target className={styles.dia} {...target}>
      <span className={styles.cabecalho}>
        <b>{when}</b>
        <span className={styles.prazo} data-proximo={next ?? false}>
          {due}
        </span>
      </span>
      <span className={styles.tijolos}>
        {bricks.map((brick, index) => (
          <span key={index} className={styles.tijolo} data-materia={brick.color}>
            <b>{brick.code}</b>
            <span>{brick.kind}</span>
          </span>
        ))}
      </span>
    </Target>
  );
}

interface SubjectCardProps extends TargetProps {
  code: string;
  color: number;
  detail?: string;
}

// Único lugar em que a cor da matéria vira fundo. Só a sigla, nunca o nome inteiro.
export function SubjectCard({ code, color, detail, ...target }: SubjectCardProps) {
  return (
    <Target className={styles.materia} subject={color} {...target}>
      <b className={styles.sigla}>{code}</b>
      {detail !== undefined && <small className={styles.apoio}>{detail}</small>}
    </Target>
  );
}
