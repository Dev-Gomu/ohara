import { helpSections } from '../../core/keyboard/keyTools';
import { Window } from '../components/Window';
import styles from './HelpWindow.module.css';

export function HelpWindow() {
  return (
    <Window id="help" title="Atalhos" testId="ajuda" wide>
      {helpSections().map((section) => (
        <section key={section.group}>
          <h3 className={styles.grupo}>{section.group}</h3>
          <dl className={styles.lista}>
            {section.rows.map((row) => (
              <div key={row.label} className={styles.linha} data-testid="atalho">
                <dt className={styles.tecla}>{row.label}</dt>
                <dd className={styles.texto}>{row.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </Window>
  );
}
