import { Button } from '../components/Button';
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
      <Button shortcut="Alt Z" onPress={runUndo}>
        Desfazer
      </Button>
      {undo.removal && (
        <Button onPress={() => dispatch({ type: 'openWindow', window: TRASH_WINDOW })}>
          Ver lixeira
        </Button>
      )}
    </div>
  );
}
