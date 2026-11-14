import { useEffect, useRef, useState } from 'react';
import { Dica } from './Dica';
import { DicaGrupo } from './DicaGrupo';
import { FormatIcon } from './FormatIcons';
import styles from './FormatBar.module.css';

export interface FormatTool {
  id: string;
  label: string;
  // Mostrado na dica ao lado do nome.
  shortcut?: string;
  // Nome do desenho em FormatIcons (quando falta, usa o id).
  icon?: string;
  sel: boolean;
  run: () => void;
}

interface FormatBarProps {
  // Na ordem de prioridade: os primeiros ficam na barra por mais tempo (D152).
  tools: readonly FormatTool[];
  // Lista do menu Aa (duas colunas).
  styleTools: readonly FormatTool[];
  // Quando passado, o contêiner vira alvo de Alt T e Alt B (D142).
  bar?: 'top';
  onExpand?: () => void;
  onOptions?: () => void;
}

// Largura que não é de botão: respiro, caderno, Aa e ⋮. Cada botão ocupa 36 + 2 de vão.
const FIXED = 24 + 26 + 38 + 36;
const STEP = 38;

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

function ToolButton({ tool }: { tool: FormatTool }) {
  return (
    <Dica content={tool.label} {...(tool.shortcut && { shortcut: tool.shortcut })}>
      <button
        type="button"
        className={styles.botao}
        aria-pressed={tool.sel}
        aria-label={tool.label}
        onPointerDown={keepSelection}
        onClick={tool.run}
      >
        <FormatIcon name={tool.icon ?? tool.id} />
      </button>
    </Dica>
  );
}

// Cabeçalho do bloco Anotações (D146): caderno, barra de formatação (D145) e ⋮ na mesma linha.
// O que não cabe sobe para o topo do menu Aa (D152). Caderno, Aa e ⋮ nunca somem.
export function FormatBar({ tools, styleTools, bar, onExpand, onOptions }: FormatBarProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [open, setOpen] = useState(false);
  const room = Math.floor((width - FIXED + 2) / STEP);
  const expandFits = onExpand !== undefined && room >= tools.length + 1;
  const shown = tools.slice(0, Math.max(0, room - (expandFits ? 1 : 0)));
  const rest = tools.slice(shown.length);
  return (
    <DicaGrupo>
      <div className={styles.faixa} ref={ref} role="toolbar" aria-label="Formatação" data-bar={bar}>
        <span className={styles.caderno}>
          <FormatIcon name="caderno" />
        </span>
        <div className={styles.grupos}>
          {shown.map((tool) => (
            <ToolButton key={tool.id} tool={tool} />
          ))}
          <div
            className={styles.mais}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
          >
            <Dica content="Mais estilos">
              <button
                type="button"
                className={styles.botao}
                aria-label="Mais estilos"
                aria-expanded={open}
                aria-pressed={open}
                onPointerDown={keepSelection}
                onClick={() => setOpen(!open)}
              >
                <FormatIcon name="aa" />
              </button>
            </Dica>
            {open && (
              <div className={styles.menu} role="menu" aria-label="Mais estilos">
                {rest.length > 0 && (
                  <div className={styles.fileira}>
                    {rest.map((tool) => (
                      <ToolButton key={tool.id} tool={tool} />
                    ))}
                  </div>
                )}
                <div className={styles.lista}>
                  {styleTools.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      role="menuitem"
                      className={styles.linha}
                      aria-pressed={tool.sel}
                      onPointerDown={keepSelection}
                      onClick={() => {
                        tool.run();
                        setOpen(false);
                      }}
                    >
                      <FormatIcon name={tool.icon ?? tool.id} />
                      <span>{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.fim}>
          {expandFits && (
            <Dica content="Ampliar bloco" shortcut="Alt M">
              <button
                type="button"
                className={styles.botao}
                aria-label="Ampliar bloco"
                onClick={onExpand}
              >
                <FormatIcon name="expandir" />
              </button>
            </Dica>
          )}
          {onOptions && (
            <Dica content="Opções" shortcut="Alt O">
              <button
                type="button"
                className={styles.botao}
                aria-label="Opções de Anotações"
                onClick={onOptions}
              >
                <FormatIcon name="mais" />
              </button>
            </Dica>
          )}
        </div>
      </div>
    </DicaGrupo>
  );
}
