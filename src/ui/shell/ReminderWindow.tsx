import { Window } from '../components/Window';
import styles from './Palette.module.css';

// Provisória: a gravação entra junto com os Lembretes.
export function ReminderWindow() {
  return (
    <Window id="reminder" title="Lembrete rápido" testId="lembrete">
      <input className={styles.busca} aria-label="Lembrete" autoFocus placeholder="Lembrar de…" />
    </Window>
  );
}
