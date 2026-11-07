import styles from './ErrorScreen.module.css';

export function Loading() {
  return (
    <main className={styles.tela} aria-busy="true">
      <p className={styles.detalhe} role="status">
        Abrindo seus dados…
      </p>
    </main>
  );
}
