import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './FormatBar.module.css';

export interface FormatTool {
  id: string;
  label: string;
  // Desenho do botão: ícone ou letras (H1, B).
  glyph: ReactNode;
  sel: boolean;
  // Quanto maior, mais cedo sai da faixa quando o bloco estreita (vai para o menu ☰).
  priority: 1 | 2 | 3 | 4;
  run: () => void;
}

interface FormatBarProps {
  groups: readonly (readonly FormatTool[])[];
  // Quando passado, o contêiner vira alvo de Alt T e Alt B (D142).
  bar?: 'top';
  onExpand?: () => void;
  onOptions?: () => void;
}

// Larguras do bloco (px) a partir das quais cada prioridade cabe na faixa.
const FITS: Record<number, number> = { 1: 0, 2: 420, 3: 540, 4: 600 };

const MENU_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 7h14M4 12h9M4 17h14" />
  </svg>
);
const EXPAND_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
  </svg>
);
const MORE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M12 5h.01M12 12h.01M12 19h.01" />
  </svg>
);

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(1000);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const watch = new ResizeObserver(() => setWidth(el.getBoundingClientRect().width));
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  return [ref, width] as const;
}

// Sem isto, o toque tira a seleção do texto antes do comando.
const keepSelection = (event: React.PointerEvent) => event.preventDefault();

function ToolButton({ tool, ...rest }: { tool: FormatTool } & Record<string, unknown>) {
  return (
    <button
      type="button"
      className={styles.botao}
      aria-pressed={tool.sel}
      aria-label={tool.label}
      title={tool.label}
      onPointerDown={keepSelection}
      onClick={tool.run}
      {...rest}
    >
      {tool.glyph}
    </button>
  );
}

// Faixa de formatação aninhada no topo do bloco: formatação à esquerda, ☰ (o que não coube),
// ampliar e ⋮ à direita. Mostra só o que cabe; o resto vai para o menu ☰.
export function FormatBar({ groups, bar, onExpand, onOptions }: FormatBarProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [open, setOpen] = useState(false);
  const fits = (tool: FormatTool) => width >= (FITS[tool.priority] ?? 0);
  const hidden = groups.flat().filter((tool) => !fits(tool));
  return (
    <div className={styles.faixa} ref={ref} role="toolbar" aria-label="Formatação" data-bar={bar}>
      <div className={styles.grupos}>
        {hidden.length > 0 && (
          <div className={styles.mais} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
            <button
              type="button"
              className={styles.botao}
              aria-label="Mais formatos"
              aria-expanded={open}
              aria-pressed={open}
              onPointerDown={keepSelection}
              onClick={() => setOpen(!open)}
            >
              {MENU_ICON}
            </button>
            {open && (
              <div className={styles.menu} role="menu">
                {hidden.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    role="menuitem"
                    onPointerDown={keepSelection}
                    onClick={() => {
                      tool.run();
                      setOpen(false);
                    }}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {groups.map((group, index) => {
          const shown = group.filter(fits);
          return shown.length === 0 ? null : (
            <div className={styles.grupo} role="group" key={index}>
              {shown.map((tool) => (
                <ToolButton key={tool.id} tool={tool} />
              ))}
            </div>
          );
        })}
      </div>
      <div className={styles.fim}>
        {onExpand && (
          <button type="button" className={styles.botao} aria-label="Ampliar bloco" title="Ampliar · Alt M" onClick={onExpand}>
            {EXPAND_ICON}
          </button>
        )}
        {onOptions && (
          <button type="button" className={styles.botao} aria-label="Opções de Anotações" title="Opções · Alt O" onClick={onOptions}>
            {MORE_ICON}
          </button>
        )}
      </div>
    </div>
  );
}
