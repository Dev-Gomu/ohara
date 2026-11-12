import type { ReactNode } from 'react';
import { Target, type TargetProps } from './Target';
import styles from './DayItem.module.css';

interface DayItemProps extends TargetProps {
  start: string;
  end: string;
  title: string;
  code: string;
  // Posição da cor da matéria: tinge o cartão inteiro (D128).
  color: number | undefined;
  past?: boolean;
  // Pílulas no fim da linha ("agora").
  children?: ReactNode;
}

// Item da Agenda de hoje: hora em duas linhas, título, sigla em texto; a matéria é um tom no fundo.
export function DayItem(props: DayItemProps) {
  const { start, end, title, code, color, past, children, ...target } = props;
  return (
    <Target className={`${styles.item} ${past ? styles.passada : ''}`} subject={color} {...target}>
      <span className={styles.hora}>
        {start}
        <small>{end}</small>
      </span>
      <span className={styles.texto}>
        <strong className={styles.titulo}>{title}</strong>
        <small className={styles.sigla}>{code}</small>
      </span>
      {children !== undefined && <span className={styles.fim}>{children}</span>}
    </Target>
  );
}
