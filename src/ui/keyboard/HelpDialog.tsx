import { Button, Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { helpSections } from '../../core/keyboard/keyTools';
import styles from './HelpDialog.module.css';
import { dispatch, useKeyboardState } from './store';

// O Esc é do listener: ele fecha pelo estado, e o React Aria nem chega a ver a tecla (D08).
export function HelpDialog() {
  const { focus } = useKeyboardState();

  return (
    <ModalOverlay className={styles.fundo} isOpen={focus.windowOpen} isKeyboardDismissDisabled>
      <Modal className={styles.caixa}>
        <Dialog className={styles.janela} data-testid="ajuda">
          <div className={styles.topo}>
            <Heading slot="title" className={styles.titulo}>
              Atalhos
            </Heading>
            <Button className={styles.fechar} onPress={() => dispatch({ type: 'escape' })}>
              Fechar
            </Button>
          </div>
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
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
