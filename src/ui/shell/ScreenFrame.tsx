import type { ReactNode } from 'react';
import { SCREENS } from '../../core/keyboard/actions';
import { SCREEN_NAMES } from '../../core/keyboard/keys';
import { dispatch, useKeyboardState } from '../keyboard/store';
import styles from './ScreenFrame.module.css';

interface ScreenFrameProps {
  title: ReactNode;
  caps?: boolean;
  bar?: ReactNode;
  end?: ReactNode;
  children: ReactNode;
}

export function ScreenFrame({ title, caps = true, bar, end, children }: ScreenFrameProps) {
  const { focus, screen } = useKeyboardState();
  const ringAt = (index: number) =>
    focus.level === 'menu' && focus.menuIndex === index ? 'anel' : '';

  return (
    <main className={styles.tela}>
      <nav className={styles.topo} data-menu aria-label="Telas">
        {SCREENS.map((id, index) => (
          <button
            key={id}
            type="button"
            className={`${styles.numero} ${ringAt(index)}`}
            data-menu-item
            data-sel={id === screen}
            aria-label={SCREEN_NAMES[id]}
            aria-current={id === screen ? 'page' : undefined}
            onClick={() => dispatch({ type: 'goToScreen', screen: id })}
          >
            {index + 1}
          </button>
        ))}
        {bar}
        <h1 className={styles.titulo} data-caps={caps}>
          {title}
        </h1>
        <div className={styles.fim}>
          {end}
          <button
            type="button"
            className={`${styles.numero} ${ringAt(SCREENS.length)}`}
            data-menu-item
            aria-label="Ajuda"
            onClick={() => dispatch({ type: 'openHelp' })}
          >
            ?
          </button>
        </div>
      </nav>
      <div className={styles.corpo}>{children}</div>
    </main>
  );
}
