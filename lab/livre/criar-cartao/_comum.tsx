// Base das três versões: o bloco Cartões de verdade (peças do app) e o campo que mostra as lacunas.
import {
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { insertCloze } from '../../../src/core/study/cardFormat';
import { clozeNumbers, hasCloze } from '../../../src/core/study/cloze';
import { Block } from '../../../src/ui/components/Block';
import { Button } from '../../../src/ui/components/Button';
import { Key } from '../../../src/ui/components/Key';
import { BlockTab, BlockTabs } from '../../../src/ui/components/Toggles';
import ed from '../../../src/ui/screens/mesa/CardEditor.module.css';
import './cc.css';

export { ed };
export type Estado = 'vazio' | 'simples' | 'cloze';
export type Tipo = 'vazio' | 'simples' | 'cloze';
export const FRASE =
  'A {{c1::IL-6}} induz a síntese de PCR no fígado, e a {{c2::IL-1}} causa febre.';
export const PERGUNTA = 'Qual citocina induz a síntese de PCR no fígado?';
export const VERSO_TXT = 'IL-6, produzida por macrófagos ativados';

export const tipoDe = (t: string): Tipo =>
  t.trim() === '' ? 'vazio' : hasCloze(t) ? 'cloze' : 'simples';
export const prontos = (t: string, v: string): number =>
  hasCloze(t) ? clozeNumbers(t).length : t.trim() !== '' && v.trim() !== '' ? 1 : 0;

/** Texto cru por baixo do campo: a resposta em destaque, as chaves apagadas (mesma largura, para o cursor alinhar). */
function Espelho({ texto, cru }: { texto: string; cru: boolean }) {
  return (
    <>
      {texto.split(/(\{\{c\d+::.+?\}\})/g).map((p, i) => {
        const m = /^(\{\{c\d+::)(.+?)(\}\})$/.exec(p);
        if (!m) return <span key={i}>{p}</span>;
        return (
          <span key={i} className="cc-lac">
            {cru && <span className="cc-chave">{m[1]}</span>}
            {m[2]}
            {cru && <span className="cc-chave">{m[3]}</span>}
          </span>
        );
      })}
      {texto.endsWith('\n') ? ' ' : ''}
    </>
  );
}

interface CampoProps {
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  refEl?: RefObject<HTMLTextAreaElement | null>;
  onEnter?: () => void;
  onSalvar?: () => void;
  onAcima?: () => void;
  /** Ctrl Shift C sem seleção: devolve true se tratou (a versão C abre as palavras). */
  onLacunaSemSelecao?: (caret: number) => boolean;
  rotulo: string;
}

/** Campo de texto: Ctrl Shift C faz lacuna, Ctrl Alt C outra lacuna no mesmo cartão (iguais ao app). */
export function Campo(p: CampoProps) {
  const interno = useRef<HTMLTextAreaElement>(null);
  const ref = p.refEl ?? interno;
  const [foco, setFoco] = useState(false);
  const aoTecla = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const c = e.currentTarget;
    const lacuna = e.ctrlKey && e.code === 'KeyC' && (e.shiftKey || e.altKey);
    if (lacuna) {
      e.preventDefault();
      if (c.selectionStart === c.selectionEnd && p.onLacunaSemSelecao?.(c.selectionStart)) return;
      const r = insertCloze(
        { text: p.valor, start: c.selectionStart, end: c.selectionEnd },
        e.altKey,
      );
      p.onChange(r.text);
      requestAnimationFrame(() => c.setSelectionRange(r.start, r.end));
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      p.onSalvar?.();
    } else if (e.key === 'Enter' && !e.shiftKey && p.onEnter) {
      e.preventDefault();
      p.onEnter();
    } else if (e.key === 'ArrowUp' && p.onAcima && c.selectionStart === 0) {
      e.preventDefault();
      p.onAcima();
    }
  };
  return (
    <div className="cc-campo">
      <div className="cc-espelho" aria-hidden="true">
        <Espelho texto={p.valor} cru={foco} />
      </div>
      <textarea
        ref={ref}
        rows={1}
        value={p.valor}
        placeholder={p.placeholder}
        aria-label={p.rotulo}
        spellCheck
        onKeyDown={aoTecla}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        onChange={(e) => p.onChange(e.target.value)}
      />
    </div>
  );
}

export function Dicas({ teclas, children }: { teclas: [string, string][]; children?: ReactNode }) {
  return (
    <p className="cc-dicas">
      {teclas.map(([k, t]) => (
        <span key={k}>
          <Key>{k}</Key>
          {t}
        </span>
      ))}
      {children}
    </p>
  );
}

interface BlocoProps {
  pronto: number;
  salvos: number;
  onSalvar: () => void;
  dicas: ReactNode;
  children: ReactNode;
}

/** O bloco Cartões da Mesa, com as peças reais: abas Novo/Salvos e Salvar no cabeçalho (D140). */
export function Bloco({ pronto, salvos, onSalvar, dicas, children }: BlocoProps) {
  const tools = (
    <>
      <BlockTabs label="Cartões">
        <BlockTab selected onPress={() => undefined}>
          Novo
        </BlockTab>
        <BlockTab selected={false} count={salvos} onPress={() => undefined}>
          Salvos
        </BlockTab>
      </BlockTabs>
      <span className="cc-salvar" onPointerDown={(e) => e.preventDefault()}>
        <Button variant="primary" disabled={pronto === 0} onPress={onSalvar}>
          {pronto > 0 ? `Salvar ${pronto}` : 'Salvar'}
        </Button>
      </span>
    </>
  );
  return (
    <div className="cc-mesa">
      <Block
        id="cc"
        title="Cartões"
        icon="cartoes"
        tools={tools}
        shortcut="Alt C"
        menu
        fixed="none"
      >
        <div className={ed.editor}>
          {salvos > 0 && (
            <p className={ed.salvou}>
              {salvos} {salvos === 1 ? 'cartão salvo' : 'cartões salvos'}.
            </p>
          )}
          {children}
          {dicas}
        </div>
      </Block>
    </div>
  );
}

/** Estado comum: frente, verso (no cloze vira o "Extra"), salvar e foco. */
export function useCartao(estado: Estado) {
  const [t, setT] = useState(estado === 'vazio' ? '' : estado === 'simples' ? PERGUNTA : FRASE);
  const [v, setV] = useState(estado === 'simples' ? VERSO_TXT : '');
  const [salvos, setSalvos] = useState(0);
  const fref = useRef<HTMLTextAreaElement>(null);
  const vref = useRef<HTMLTextAreaElement>(null);
  const pronto = prontos(t, v);
  const salvar = () => {
    if (pronto === 0) return;
    setSalvos((n) => n + pronto);
    setT('');
    setV('');
    fref.current?.focus();
  };
  return {
    t,
    setT,
    v,
    setV,
    salvos,
    fref,
    vref,
    pronto,
    salvar,
    tipo: tipoDe(t),
    nums: clozeNumbers(t),
  };
}

export function Palco({
  titulo,
  nota,
  Corpo,
}: {
  titulo: string;
  nota: ReactNode;
  Corpo: ComponentType<{ estado: Estado }>;
}) {
  const [e, setE] = useState<Estado>(
    () => (new URLSearchParams(location.search).get('estado') as Estado | null) ?? 'cloze',
  );
  return (
    <section className="cc">
      <div className="cc-topo">
        <h2>{titulo}</h2>
        <div className="cc-estados" role="group" aria-label="Começar com">
          {(['vazio', 'simples', 'cloze'] as Estado[]).map((x) => (
            <button key={x} data-on={e === x} onClick={() => setE(x)}>
              {x === 'vazio' ? 'Vazio' : x === 'simples' ? 'Pergunta' : 'Cloze'}
            </button>
          ))}
        </div>
      </div>
      <div className="cc-palco">
        <Corpo key={e} estado={e} />
        <div className="cc-nota">{nota}</div>
      </div>
    </section>
  );
}
