// Barra da referência do usuário (13/11): esquerda = menu, títulos, estilos, marca-texto, listas, link; direita = marcador, Aa, ⋮, expandir, fechar.
import { useState, type ReactNode } from 'react';
import { Btn, Pagina, type Ferr } from './_partes';
import { Nota, Caixa } from '../mesa-blocos/_partes';

const T = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const f = (id: string, nome: string, tecla: string, icone: ReactNode, rotulo: ReactNode = nome): Ferr => ({ id, nome, tecla, icone, rotulo });

export const ESQ: Ferr[][] = [
  [f('menu', 'Menu de formatos', '', <T><path d="M4 7h14M4 12h9M4 17h14" /></T>)],
  [
    f('h1', 'Título 1', 'Ctrl Alt 1', <T><path d="M4 5v14M12 5v14M4 12h8M16 9l2.5-1.5V19" /></T>, <b>H1</b>),
    f('h2', 'Título 2', 'Ctrl Alt 2', <T><path d="M3 5v14M11 5v14M3 12h8M15 9.5a2.3 2.3 0 014 1.4c0 2-4 3.5-4 6.1h4.2" /></T>, <b>H2</b>),
  ],
  [
    f('negrito', 'Negrito', 'Ctrl B', <T><path d="M7 5h6a3.5 3.5 0 010 7H7zM7 12h7a3.5 3.5 0 010 7H7z" /></T>, <b>B</b>),
    f('italico', 'Itálico', 'Ctrl I', <T><path d="M10 5h7M7 19h7M14 5l-4 14" /></T>, <i>I</i>),
    f('sublinhado', 'Sublinhado', 'Ctrl U', <T><path d="M7 5v7a5 5 0 0010 0V5M6 20h12" /></T>, <u>U</u>),
  ],
  [f('marca', 'Marca-texto', 'Ctrl Shift H', <T><path d="M13 4l5 5-7 7H6v-5zM4 21h16" /></T>)],
  [
    f('topicos', 'Lista com tópicos', 'Ctrl Shift 8', <T><path d="M10 6h10M10 12h10M10 18h10M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></T>),
    f('numerada', 'Lista numerada', 'Ctrl Shift 7', <T><path d="M11 6h9M11 12h9M11 18h9M4 5l1.5-1v5M4 14.5a1.3 1.3 0 012.4.6c0 1-2.4 1.4-2.4 2.9h2.6" /></T>),
    f('tarefas', 'Lista de tarefas', 'Ctrl Shift 9', <T><rect x="3.5" y="4" width="6" height="6" rx="1.5" /><path d="M4.8 15.5l1.7 1.7 2.8-3M13 7h7M13 17h7" /></T>),
  ],
  [f('link', 'Link', 'Ctrl K', <T><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></T>)],
];
export const DIR: Ferr[] = [
  f('marcador', 'Marcador', '', <T><path d="M7 4h10v16l-5-3.5L7 20z" /></T>),
  f('aa', 'Tamanho do texto', '', <T><path d="M3 18l5-12 5 12M5 14h6M15 18l3-7 3 7M16 16h4" /></T>, <b>Aa</b>),
  f('mais', 'Mais opções', '', <T><path d="M12 5h.01M12 12h.01M12 19h.01" strokeWidth="2.4" /></T>),
  f('expandir', 'Expandir', '', <T><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></T>),
  f('fechar', 'Fechar barra', '', <T><path d="M6 6l12 12M18 6L6 18" /></T>),
];

export const LETRAS = ['h1', 'h2', 'negrito', 'italico', 'sublinhado', 'aa'];
function Barra({ cls, inicial }: { cls: string; inicial: string[] }) {
  const [sel, setSel] = useState<string[]>(inicial);
  const alterna = (id: string) => setSel((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const b = (x: Ferr) => (
    <Btn key={x.id} f={x} sel={sel.includes(x.id)} alterna={alterna} modo={LETRAS.includes(x.id) ? 'rotulo' : 'icone'} />
  );
  return (
    <div className={`bf-barra bf-ref ${cls}`} role="toolbar" aria-label="Formatação">
      {ESQ.map((g, i) => <div className="bf-grupo" key={i} role="group">{g.map(b)}</div>)}
      <div className="bf-grupo bf-dir" role="group">{DIR.map(b)}</div>
    </div>
  );
}
export function Pag({ cls, inicial = ['marcador', 'aa'] }: { cls: string; inicial?: string[] }) {
  return (
    <Pagina>
      {(l) => (
        <div className="bf-quadro" style={l ? { width: l } : undefined}>
          <Caixa id="notas">
            <Barra cls={cls} inicial={inicial} />
            <Nota />
          </Caixa>
        </div>
      )}
    </Pagina>
  );
}
