import type { ReactNode } from 'react';
import { Button, Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { dispatch, useKeyboardState } from '../keyboard/store';
import { Key } from './Key';
import styles from './Window.module.css';

interface WindowProps {
  id: string;
  title: string;
  testId?: string;
  wide?: boolean;
  children: ReactNode;
}

// O Esc é do listener: ele fecha pelo estado, e o React Aria nem chega a ver a tecla (D08).
export function Window({ id, title, testId, wide, children }: WindowProps) {
  const { focus } = useKeyboardState();
  return (
    <ModalOverlay
      className={styles.veu}
      isOpen={focus.window === id}
      isKeyboardDismissDisabled
      isDismissable
      onOpenChange={(open) => {
        if (!open) dispatch({ type: 'escape' });
      }}
    >
      <Modal className={`${styles.caixa} ${wide ? styles.larga : ''}`}>
        <Dialog className={styles.janela} data-testid={testId} aria-label={title}>
          <div className={styles.topo}>
            <Heading slot="title" className={styles.titulo}>
              {title}
            </Heading>
            <Button className={styles.fechar} onPress={() => dispatch({ type: 'escape' })}>
              Fechar <Key>Esc</Key>
            </Button>
          </div>
          {children}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
