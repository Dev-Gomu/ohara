import { Target, type TargetProps } from './Target';
import styles from './Cards.module.css';

export interface DayBrick {
  code: string;
  color: number;
  // Texto do app, já pronto: "prova", "trabalho", "apres.".
  kind: string;
}

interface AssessmentDayCardProps extends TargetProps {
  // Texto do app, já pronto: "TER 17" e "em 7 d". O mês ("nov") vem à parte.
  when: string;
  month?: string;
  due: string;
  // O dia mais próximo é o único que mostra a contagem, em pílula cheia de ação (D128).
  next?: boolean;
  bricks: readonly DayBrick[];
}

// Dia de avaliação: número grande, dia da semana e mês, e uma pílula de sigla para cada prova ou trabalho.
// A peça alarga com a quantidade de pílulas; o tipo (prova, trabalho) fica no rótulo falado.
export function AssessmentDayCard(props: AssessmentDayCardProps) {
  const { when, month, due, next, bricks, ...target } = props;
  const [weekday = '', number = ''] = when.split(' ');
  return (
    <Target className={styles.dia} {...target}>
      <span className={styles.cabecalho}>
        <b className={styles.numero}>{number}</b>
        <span className={styles.data}>
          <span>{weekday}</span>
          {month !== undefined && <small>{month}</small>}
        </span>
        {next && <span className={styles.prazo}>{due}</span>}
      </span>
      <span className={styles.pilulas}>
        {bricks.map((brick, index) => (
          <span key={index} className={styles.pilulaSigla} data-materia={brick.color}>
            {brick.code}
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
