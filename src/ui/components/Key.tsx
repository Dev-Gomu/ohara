import styles from './Key.module.css';

// Tecla: a mesma pecinha em todo lugar que ensina um atalho (diretrizes 6.6). Nunca clicável sozinha.
export function Key({ children }: { children: string }) {
  return <kbd className={styles.tecla}>{children}</kbd>;
}
