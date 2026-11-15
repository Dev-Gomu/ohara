import type { ReactNode } from 'react';
import { Dialog, Menu, MenuItem, Modal, ModalOverlay } from 'react-aria-components';
import { Dica } from '../components/Dica';
import { Key } from '../components/Key';
import { dispatch, useKeyboardState } from '../keyboard/store';
import { openFaults, openNotes } from '../study/navigation';
import { TRASH_WINDOW } from './commands';
import styles from './TopMenu.module.css';

const WINDOW = 'topmenu';

const Traco = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const ITEMS: readonly {
  id: string;
  label: string;
  keys?: string;
  icon: ReactNode;
  run: () => void;
}[] = [
  {
    id: 'faltas',
    label: 'Faltas',
    icon: (
      <Traco>
        <rect x="4" y="5" width="16" height="15" rx="3" />
        <path d="M8 3v4M16 3v4M9.5 11l5 5M14.5 11l-5 5" />
      </Traco>
    ),
    run: openFaults,
  },
  {
    id: 'notas',
    label: 'Notas',
    icon: (
      <Traco>
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </Traco>
    ),
    run: openNotes,
  },
  {
    id: 'lixeira',
    label: 'Lixeira',
    icon: (
      <Traco>
        <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
      </Traco>
    ),
    run: () => dispatch({ type: 'openWindow', window: TRASH_WINDOW }),
  },
  {
    id: 'ajuda',
    label: 'Ajuda',
    keys: 'Alt /',
    icon: <span className={styles.sinal}>?</span>,
    run: () => dispatch({ type: 'openHelp' }),
  },
];

// Botão de três traços na barra do topo, em todas as telas (D137). Enter no nível menu o clica.
export function TopMenuButton({ cursor }: { cursor: boolean }) {
  return (
    <Dica content="Mais" side="bottom">
      <button
        type="button"
        className={cursor ? `${styles.botao} anel-fino` : styles.botao}
        data-menu-item=""
        aria-label="Mais"
        aria-haspopup="menu"
        onClick={() => dispatch({ type: 'openWindow', window: WINDOW })}
      >
        <Traco>
          <path d="M5 7h14M5 12h14M5 17h14" />
        </Traco>
      </button>
    </Dica>
  );
}

// Setas e Enter ficam com o React Aria; o Esc é do listener (janela aberta).
export function TopMenuWindow() {
  const { focus } = useKeyboardState();

  function run(id: React.Key) {
    dispatch({ type: 'escape' });
    ITEMS.find((item) => item.id === id)?.run();
  }

  return (
    <ModalOverlay
      className={styles.veu}
      isOpen={focus.window === WINDOW}
      isKeyboardDismissDisabled
      isDismissable
      onOpenChange={(open) => {
        if (!open) dispatch({ type: 'escape' });
      }}
    >
      <Modal className={styles.caixa}>
        <Dialog aria-label="Mais" data-testid="menu-topo" className={styles.janela}>
          <Menu
            autoFocus="first"
            aria-label="Mais"
            items={ITEMS}
            onAction={run}
            className={styles.lista}
          >
            {(item) => (
              <MenuItem className={styles.item} textValue={item.label}>
                <span className={styles.icone}>{item.icon}</span>
                <span>{item.label}</span>
                {item.keys !== undefined && <Key>{item.keys}</Key>}
              </MenuItem>
            )}
          </Menu>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
