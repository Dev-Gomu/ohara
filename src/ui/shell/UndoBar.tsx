import { runUndo, useUndoLabel } from '../study/undo';
import styles from './Shell.module.css';

export function UndoBar() {
  const label = useUndoLabel();
  if (label === null) return null;
  return (
    <div className={styles.aviso} role="status" data-testid="desfazer">
      <span>{label}</span>
      <button type="button" className={styles.botao} onClick={runUndo}>
        Desfazer <kbd>Alt Z</kbd>
      </button>
    </div>
  );
}
