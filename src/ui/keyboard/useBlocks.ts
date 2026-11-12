import { useLayoutEffect } from 'react';
import { dispatch, getKeyboardState, registerScreen, type ScreenRegistration } from './store';

// Cada tela declara seus blocos. Sem deps: a contagem de itens muda com o filtro.
export function useBlocks(registration: ScreenRegistration): void {
  useLayoutEffect(() => {
    registerScreen(registration);
    const { focus } = getKeyboardState();
    const known = registration.blocks.some((block) => block.id === focus.block);
    if (!known) dispatch({ type: 'jump', ...registration.arrival });
  });
}
