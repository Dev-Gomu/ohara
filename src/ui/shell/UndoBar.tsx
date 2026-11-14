import { Key } from '../components/Key';
import { useNotice } from '../study/notice';
import { dispatch } from '../keyboard/store';
import { runUndo, useUndo } from '../study/undo';
import { TRASH_WINDOW } from './commands';
import styles from './Shell.module.css';

export function UndoBar() {
  const undo = useUndo();
  const notice = useNotice();
  if (undo === null) {
    return notice === null ? null : (
      <div className={styles.aviso} role="status" data-testid="aviso">
        <span>{notice}</span>
      </div>
    );
  }
  return (
    <div className={styles.aviso} role="status" data-testid="desfazer">
      <span>{undo.label}</span>
      <button type="button" className={styles.botao} onClick={runUndo}>
        Desfazer <Key>Alt Z</Key>
      </button>
      {undo.removal && (
        <button
          type="button"
          className={styles.botao}
          onClick={() => dispatch({ type: 'openWindow', window: TRASH_WINDOW })}
        >
          Ver lixeira
        </button>
      )}
    </div>
  );
}
