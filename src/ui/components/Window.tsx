import type { ReactNode } from 'react';
import { Button, Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { dispatch, useKeyboardState } from '../keyboard/store';
import styles from './Window.module.css';

interface WindowProps {
  id: string;
  title: string;
  // De onde a janela veio (bloco ou tela): rótulo pequeno acima do título.
  context?: string;
  testId?: string;
  wide?: boolean;
  children: ReactNode;
}

// O Esc é do listener: ele fecha pelo estado, e o React Aria nem chega a ver a tecla (D08).
// Rodapé de ações: os botões dividem a largura em partes iguais, sem atalhos escritos.
export function WindowFooter({ children }: { children: ReactNode }) {
  return <div className={styles.pe}>{children}</div>;
}

export function Window({ id, title, context, testId, wide, children }: WindowProps) {
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
            <div className={styles.titulos}>
              {context && <small className={styles.contexto}>{context}</small>}
              <Heading slot="title" className={styles.titulo}>
                {title}
              </Heading>
            </div>
            <Button
              className={styles.fechar}
              aria-label="Fechar"
              onPress={() => dispatch({ type: 'escape' })}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </Button>
          </div>
          {children}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
