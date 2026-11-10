import { Key } from '../components/Key';
import { useNotice } from '../study/notice';
import { runUndo, useUndoLabel } from '../study/undo';
import styles from './Shell.module.css';

export function UndoBar() {
  const label = useUndoLabel();
  const notice = useNotice();
  if (label === null) {
    return notice === null ? null : (
      <div className={styles.aviso} role="status" data-testid="aviso">
        <span>{notice}</span>
      </div>
    );
  }
  return (
    <div className={styles.aviso} role="status" data-testid="desfazer">
      <span>{label}</span>
      <button type="button" className={styles.botao} onClick={runUndo}>
        Desfazer <Key>Alt Z</Key>
      </button>
    </div>
  );
}
