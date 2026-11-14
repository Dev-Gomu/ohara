// Partes comuns da bancada da Lixeira: dados, teclado simulado (só na bancada; no app vira linha
// da tabela de teclas) e a confirmação de "Apagar de vez".
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LIXEIRA } from '../../_dados';
import { Button } from '../../../src/ui/components/Button';
import { Key } from '../../../src/ui/components/Key';
import './lixeira.css';

export type Item = (typeof LIXEIRA)[number];
export type Tipo = Item['tipo'];

export const TIPOS: readonly { id: Tipo; nome: string; um: string; m?: boolean }[] = [
  { id: 'materia', nome: 'Matérias', um: 'Matéria' },
  { id: 'pasta', nome: 'Pastas', um: 'Pasta' },
  { id: 'aula', nome: 'Aulas', um: 'Aula' },
  { id: 'cartao', nome: 'Cartões', um: 'Cartão', m: true },
  { id: 'prova', nome: 'Provas', um: 'Prova' },
  { id: 'anexo', nome: 'Anexos', um: 'Anexo', m: true },
  { id: 'lembrete', nome: 'Lembretes', um: 'Lembrete', m: true },
];
export const PRAZO = 30;
export const porTipo = (a: Item, b: Item): number =>
  TIPOS.findIndex((t) => t.id === a.tipo) - TIPOS.findIndex((t) => t.id === b.tipo);
export const excluid = (t: Tipo): string => (TIPOS.find((x) => x.id === t)?.m ? 'excluído' : 'excluída');
export const umTipo = (t: Tipo): string => TIPOS.find((x) => x.id === t)?.um ?? t;
export const quando = (d: number): string => (d === 0 ? 'hoje' : d === 1 ? 'ontem' : `há ${d} d`);
export const resta = (d: number): string | null =>
  PRAZO - d <= 7 ? `some em ${PRAZO - d} d` : null;

const pedido = new URLSearchParams(location.search);
const VAZIA = pedido.get('vazia') === '1';

/** Estado da janela: itens, busca, cursor, menu ⋮ e confirmação. */
export function useLixeira(
  filtro: (i: Item) => boolean = () => true,
  ordem: (a: Item, b: Item) => number = () => 0,
) {
  const [itens, setItens] = useState<Item[]>(VAZIA ? [] : [...LIXEIRA]);
  const [busca, setBusca] = useState(pedido.get('busca') ?? '');
  const [cursor, setCursor] = useState(Number(pedido.get('cursor') ?? 0));
  const [menu, setMenu] = useState(pedido.get('menu') === '1');
  const [confirma, setConfirma] = useState(pedido.get('confirma') === '1');
  const [aviso, setAviso] = useState<string | null>(null);
  const termo = busca.trim().toLowerCase();
  const vistos = itens
    .filter((i) => filtro(i) && (termo === '' || `${i.titulo} ${i.materia}`.toLowerCase().includes(termo)))
    .sort(ordem);
  const atual = vistos[Math.min(cursor, vistos.length - 1)];
  const tirar = (texto: string) => {
    if (!atual) return;
    setItens((l) => l.filter((x) => x.id !== atual.id));
    setAviso(texto);
    setMenu(false);
    setConfirma(false);
  };
  return {
    itens,
    vistos,
    atual,
    busca,
    setBusca,
    cursor: Math.min(cursor, Math.max(vistos.length - 1, 0)),
    setCursor,
    menu,
    setMenu,
    confirma,
    setConfirma,
    aviso,
    setAviso,
    restaurar: () => atual && tirar(`Voltou ao lugar: ${umTipo(atual.tipo).toLowerCase()} “${curto(atual.titulo)}”`),
    apagar: () => atual && tirar(`Apagou de vez: “${curto(atual.titulo)}”`),
    total: itens.length,
  };
}
export type Lix = ReturnType<typeof useLixeira>;
const curto = (t: string) => (t.length > 34 ? `${t.slice(0, 32)}…` : t);

/** Teclado simulado da bancada (no app: tabela de teclas, nunca keydown em componente). */
export function useTeclas(
  l: Lix,
  busca: React.RefObject<HTMLInputElement | null>,
  extra?: (e: KeyboardEvent) => boolean,
) {
  const raiz = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const no = raiz.current;
    if (!no) return;
    const aoTecla = (e: KeyboardEvent) => {
      const noCampo = e.target === busca.current;
      if (extra?.(e)) return e.preventDefault();
      if (e.code === 'Escape') {
        if (l.confirma) l.setConfirma(false);
        else if (l.menu) l.setMenu(false);
        else if (noCampo) no.focus();
        else l.setAviso('Esc fecha a janela e devolve o foco para onde estava.');
        return e.preventDefault();
      }
      if (e.altKey && e.code === 'KeyF') {
        busca.current?.focus();
        return e.preventDefault();
      }
      if (l.confirma) {
        if (e.code === 'Enter') {
          // Foco nasce em Cancelar: Enter sozinho nunca apaga.
          if ((e.target as HTMLElement).classList.contains('lx-bt-perigo')) l.apagar();
          else l.setConfirma(false);
          return e.preventDefault();
        }
        return;
      }
      if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
        const passo = e.code === 'ArrowDown' ? 1 : -1;
        l.setCursor(Math.max(0, Math.min(l.vistos.length - 1, l.cursor + passo)));
        if (noCampo) no.focus();
        return e.preventDefault();
      }
      if (noCampo) return;
      if (e.altKey && e.code === 'KeyO') {
        l.setMenu(!l.menu);
        return e.preventDefault();
      }
      if (l.menu && e.code === 'Enter') {
        l.setMenu(false);
        l.setConfirma(true);
        return e.preventDefault();
      }
      if (e.code === 'Enter') {
        l.restaurar();
        return e.preventDefault();
      }
    };
    no.addEventListener('keydown', aoTecla);
    return () => no.removeEventListener('keydown', aoTecla);
  });
  useEffect(() => {
    raiz.current?.focus();
  }, []);
  return raiz;
}

/** Ações da linha com cursor: Restaurar (principal) e ⋮. O ⋮ abre Restaurar / Apagar de vez. */
export function AcoesLinha({ l }: { l: Lix }) {
  return (
    <span className="lx-acoes" onClick={(e) => e.stopPropagation()}>
      <Button variant="primary" onPress={l.restaurar}>
        Restaurar
      </Button>
      <button
        type="button"
        className="lx-mais"
        aria-label="Opções"
        aria-expanded={l.menu}
        onClick={() => l.setMenu(!l.menu)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
          <rect x="10.5" y="4" width="3" height="4" rx="1.5" />
          <rect x="10.5" y="10" width="3" height="4" rx="1.5" />
          <rect x="10.5" y="16" width="3" height="4" rx="1.5" />
        </svg>
      </button>
      {l.menu && (
        <span className="lx-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              l.setMenu(false);
              l.restaurar();
            }}
          >
            Restaurar <Key>Enter</Key>
          </button>
          <button
            type="button"
            role="menuitem"
            data-sel="true"
            className="lx-perigo"
            onClick={() => {
              l.setMenu(false);
              l.setConfirma(true);
            }}
          >
            Apagar de vez…
          </button>
        </span>
      )}
    </span>
  );
}

/** Confirmação dentro da janela: o foco nasce em Cancelar; apagar pede o dedo ou Tab + Enter. */
export function Confirma({ l }: { l: Lix }) {
  const a = l.atual;
  if (!l.confirma || !a) return null;
  return (
    <div className="lx-confirma" role="alertdialog" aria-label="Apagar de vez">
      <div className="lx-confirma-caixa">
        <h3>Apagar de vez?</h3>
        <p>
          <b>{a.titulo}</b>
        </p>
        <p className="lx-apoio">{a.traz ? `Some junto: ${a.traz}. ` : ''}Não dá para desfazer.</p>
        <div className="lx-confirma-pe">
          <button
            type="button"
            className="lx-bt"
            data-cursor="true"
            autoFocus
            onClick={() => l.setConfirma(false)}
          >
            Cancelar
          </button>
          <button type="button" className="lx-bt lx-bt-perigo" onClick={l.apagar}>
            Apagar de vez
          </button>
        </div>
      </div>
    </div>
  );
}

/** Moldura da janela de consulta (mesmo desenho do Window.module.css), sem o React Aria. */
export function Janela({
  larga,
  l,
  raiz,
  children,
  pe,
}: {
  larga?: boolean;
  l: Lix;
  raiz: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
  pe?: ReactNode;
}) {
  return (
    <div className="lx-veu">
      <div
        ref={raiz}
        tabIndex={-1}
        className={`lx-janela${larga ? ' lx-larga' : ''}`}
        role="dialog"
        aria-label="Lixeira"
      >
        <div className="lx-topo">
          <div className="lx-titulos">
            <small>Menu de comandos</small>
            <h2>Lixeira</h2>
          </div>
          <span className="lx-conta">
            {l.total} {l.total === 1 ? 'item' : 'itens'} · somem após {PRAZO} dias
          </span>
          <button type="button" className="lx-fechar" aria-label="Fechar">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
        {pe}
        {l.aviso && (
          <p className="lx-aviso" role="status">
            {l.aviso}
            {l.aviso.startsWith('Esc') ? null : (
              <>
                {' '}
                · <b>Desfazer</b> <Key>Alt Z</Key>
              </>
            )}
          </p>
        )}
        <Confirma l={l} />
      </div>
    </div>
  );
}

export function Vazia({ busca }: { busca: string }) {
  return busca.trim() !== '' ? (
    <p className="lx-vazia">Nada com “{busca.trim()}” na lixeira.</p>
  ) : (
    <div className="lx-vazia">
      <b>A lixeira está vazia.</b>
      <span>O que você excluir fica aqui por {PRAZO} dias, para restaurar.</span>
    </div>
  );
}

/** Rodapé de teclas (o que vale agora), como o indicador de nível. */
export function Teclas({ itens }: { itens: [string, string][] }) {
  return (
    <p className="lx-teclas">
      {itens.map(([k, t]) => (
        <span key={k}>
          <Key>{k}</Key> {t}
        </span>
      ))}
    </p>
  );
}

/** Como se chega: barra do topo com o ícone da Lixeira entre Notas e Ajuda, e o aviso do Desfazer. */
export function Entrada() {
  return (
    <div className="lx-entrada">
      <span className="lx-ent-rotulo">Como se chega</span>
      <span className="lx-ent-barra">
        <span>Faltas</span>
        <span>Notas</span>
        <span className="lx-ent-lixo" aria-label="Lixeira">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
          </svg>
        </span>
        <span>?</span>
      </span>
      <span className="lx-ent-paleta">
        <Key>Alt P</Key> “lixeira” <Key>Enter</Key>
      </span>
      <span className="lx-ent-aviso">
        Aula excluída · <b>Desfazer</b> <Key>Alt Z</Key> · <u>Ver lixeira</u>
      </span>
    </div>
  );
}
