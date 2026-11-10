import type { ReactNode } from 'react';
import { Target, type TargetProps } from './Target';
import styles from './ListItem.module.css';

interface ListItemProps extends TargetProps {
  time?: string;
  title: string;
  detail?: string;
  // Aula que já aconteceu: título apagado, continua navegável.
  past?: boolean;
  // Escolhido sem consequência (lembrete, dia do Hub) só aparece com o bloco aceso.
  quietSelection?: boolean;
  // Pílulas no fim da linha.
  children?: ReactNode;
}

// Item de lista: hora, depois título e apoio, depois pílulas.
export function ListItem(props: ListItemProps) {
  const { time, title, detail, past, quietSelection, children, ...target } = props;
  const classes = [styles.item, past && styles.passada, quietSelection && styles.discreta];
  return (
    <Target className={classes.filter(Boolean).join(' ')} {...target}>
      {time !== undefined && <time className={styles.hora}>{time}</time>}
      <span className={styles.texto}>
        <strong className={styles.titulo}>{title}</strong>
        {detail !== undefined && <small className={styles.apoio}>{detail}</small>}
      </span>
      {children !== undefined && <span className={styles.fim}>{children}</span>}
    </Target>
  );
}
