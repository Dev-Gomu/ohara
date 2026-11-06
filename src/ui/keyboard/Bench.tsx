import { useEffect, useLayoutEffect, useRef } from 'react';
import type { Level } from '../../core/keyboard/actions';
import { overlayOf } from '../../core/keyboard/focus';
import { KEYS } from '../../core/keyboard/keys';
import styles from './Bench.module.css';
import { HelpDialog } from './HelpDialog';
import { startKeyboard } from './listener';
import { dispatch, useKeyboardState } from './store';

const LEVEL_NAMES: Record<Level, string> = { menu: 'menu', block: 'bloco', field: 'campo' };

const BLOCKS = [
  { id: 'slides', name: 'Slides' },
  { id: 'notes', name: 'Anotações' },
  { id: 'cards', name: 'Cartões' },
];

const MENU_ROWS = KEYS.filter((key) => key.group === 'Telas' || key.label === 'Alt /');

// Tela provisória para o roteiro da Etapa 2. Sai quando a Etapa 3 ou 4 a substituir.
export function Bench() {
  const { focus, lastAction } = useKeyboardState();
  const root = useRef<HTMLDivElement>(null);
  const overlay = overlayOf(focus);
  const blockName = BLOCKS.find((block) => block.id === focus.block)?.name;

  useEffect(startKeyboard, []);

  useLayoutEffect(() => {
    const field = root.current?.querySelector<HTMLElement>(
      `[data-block="${focus.block}"] [data-field]`,
    );
    if (focus.level === 'field' && overlay === 'none') {
      field?.focus();
    } else if (document.activeElement?.matches('[data-field]')) {
      (document.activeElement as HTMLElement).blur();
    }
  }, [focus.level, focus.block, overlay]);

  return (
    <div ref={root} className={styles.bancada}>
      <nav className={styles.menu} data-menu aria-label="Menu">
        {MENU_ROWS.map((row, index) => (
          <button
            key={row.label}
            className={styles.item}
            data-menu-item
            data-alvo={focus.level === 'menu' && index === focus.menuIndex}
            onClick={() => dispatch(row.action)}
          >
            {row.text}
          </button>
        ))}
      </nav>

      <div className={styles.mesa}>
        {BLOCKS.map((block) => (
          <section
            key={block.id}
            className={styles.bloco}
            data-block={block.id}
            data-foco={focus.level !== 'menu' && focus.block === block.id}
          >
            <h2 className={styles.nome}>{block.name}</h2>
            <textarea className={styles.campo} data-field aria-label={block.name} rows={2} />
          </section>
        ))}
      </div>

      <p className={styles.estado} role="status">
        Nível: <b data-testid="nivel">{LEVEL_NAMES[focus.level]}</b> · Bloco:{' '}
        <b data-testid="bloco">{blockName}</b> · Última ação:{' '}
        <b data-testid="ultima-acao">{lastAction ?? 'nenhuma'}</b>
      </p>

      {focus.optionsOpen && (
        <div className={styles.opcoes} data-testid="opcoes">
          <span>Menu ⋮ de {blockName} (provisório)</span>
          <button className={styles.item} onClick={() => dispatch({ type: 'escape' })}>
            Fechar
          </button>
        </div>
      )}

      <HelpDialog />
    </div>
  );
}
