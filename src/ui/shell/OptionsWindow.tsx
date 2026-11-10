import { Dialog, Menu, MenuItem, Modal, ModalOverlay } from 'react-aria-components';
import { Key } from '../components/Key';
import { blockOptions, dispatch, useKeyboardState } from '../keyboard/store';
import styles from './OptionsWindow.module.css';

// Menu ⋮ do bloco. Setas e Enter ficam com o React Aria; o Esc é do listener (D18).
export function OptionsWindow() {
  const { focus } = useKeyboardState();
  const options = focus.optionsOpen ? blockOptions(focus.block) : [];

  function run(id: React.Key) {
    dispatch({ type: 'escape' });
    options.find((option) => option.id === id)?.run();
  }

  return (
    <ModalOverlay
      className={styles.veu}
      isOpen={focus.optionsOpen}
      isKeyboardDismissDisabled
      isDismissable
      onOpenChange={(open) => {
        if (!open) dispatch({ type: 'escape' });
      }}
    >
      <Modal className={styles.caixa}>
        <Dialog aria-label="Opções do bloco" data-testid="opcoes" className={styles.janela}>
          <Menu
            autoFocus="first"
            aria-label="Opções"
            items={options}
            onAction={run}
            className={styles.lista}
            renderEmptyState={() => <p className={styles.vazio}>Sem opções neste bloco.</p>}
          >
            {(option) => (
              <MenuItem className={styles.item} textValue={option.label}>
                <span>{option.label}</span>
                {option.keys !== undefined && <Key>{option.keys}</Key>}
              </MenuItem>
            )}
          </Menu>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
