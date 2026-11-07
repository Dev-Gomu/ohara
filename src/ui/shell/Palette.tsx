import { Autocomplete, Input, Menu, MenuItem, SearchField, useFilter } from 'react-aria-components';
import { Window } from '../components/Window';
import { dispatch } from '../keyboard/store';
import { commands } from './commands';
import styles from './Palette.module.css';

// D13: React Aria, já presente no app. As setas e o Enter ficam com ele enquanto a janela
// está aberta (D65); o Esc continua sendo do listener.
export function Palette() {
  const { contains } = useFilter({ sensitivity: 'base' });
  const list = commands();

  function run(id: React.Key) {
    dispatch({ type: 'escape' });
    list.find((command) => command.id === id)?.run();
  }

  return (
    <Window id="palette" title="Ir para" testId="paleta">
      <Autocomplete filter={contains}>
        <SearchField aria-label="Ir para" autoFocus>
          <Input className={styles.busca} placeholder="Tela, comando…" />
        </SearchField>
        <Menu
          className={styles.lista}
          aria-label="Resultados"
          items={list}
          onAction={run}
          renderEmptyState={() => <p className={styles.vazio}>Nada encontrado.</p>}
        >
          {(command) => (
            <MenuItem className={styles.item} textValue={command.label}>
              <span>{command.label}</span>
              {command.keys !== undefined && <kbd className={styles.tecla}>{command.keys}</kbd>}
            </MenuItem>
          )}
        </Menu>
      </Autocomplete>
    </Window>
  );
}
