import { useRegisterSW } from 'virtual:pwa-register/react';
import styles from './App.module.css';

export function App() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  return (
    <main className={styles.tela}>
      <h1 className={styles.nome}>Ohara</h1>
      <p className={styles.versao}>versão {__APP_VERSION__}</p>
      {needRefresh && (
        <div className={styles.aviso} role="status">
          <span>Há uma versão nova.</span>
          <button className={styles.botao} onClick={() => void updateServiceWorker(true)}>
            Atualizar
          </button>
        </div>
      )}
    </main>
  );
}
