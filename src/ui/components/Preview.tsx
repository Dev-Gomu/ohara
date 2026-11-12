import type { ReactNode } from 'react';
import styles from './Preview.module.css';

interface PreviewProps {
  title: string;
  // Linha de apoio: hora, matéria, contagens.
  detail?: string;
  // Botões; o principal é um só.
  actions?: ReactNode;
  children?: ReactNode;
}

// Prévia do item escolhido. O título é texto do usuário: fica como foi digitado.
export function Preview({ title, detail, actions, children }: PreviewProps) {
  return (
    <div className={styles.previa}>
      <h3 className={styles.titulo}>{title}</h3>
      {detail !== undefined && <p className={styles.apoio}>{detail}</p>}
      <div className={styles.corpo}>{children}</div>
      {actions !== undefined && <div className={styles.acoes}>{actions}</div>}
    </div>
  );
}
