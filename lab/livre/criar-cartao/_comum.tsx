// P1 · Limpo (escolhido), pílula suave com o número da lacuna. A escrita é a real do app, {{c1::resposta}};
// o campo desenha cada pedaço ({{, c1, ::, resposta, }}) com a mesma largura de letra, então o cursor alinha.
// Cada versão só decide, por CSS, o que desses pedaços aparece.
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { insertCloze } from '../../../src/core/study/cardFormat';
import { clozeNumbers } from '../../../src/core/study/cloze';
import { Block } from '../../../src/ui/components/Block';
import { Button } from '../../../src/ui/components/Button';
import { Key } from '../../../src/ui/components/Key';
import { BlockTab, BlockTabs } from '../../../src/ui/components/Toggles';
import ed from '../../../src/ui/screens/mesa/CardEditor.module.css';
import './cc.css';

export type Estado = 'vazio' | 'simples' | 'cloze';
export type Marca = 'segmento' | 'cru' | 'tom';
const FRASE = 'A {{c1::IL-1}} e o {{c1::TNF-α}} causam febre; a {{c2::IL-6}} induz a síntese de {{c3::PCR}} no fígado.';
const PERGUNTA = 'Qual citocina induz a síntese de PCR no fígado?';
const VERSO_TXT = 'IL-6, produzida por macrófagos ativados';

const PEDACO = /(\{\{c\d+::.+?\}\})/g;
const UMA = /^\{\{(c(\d+))::(.+?)\}\}$/;

function Espelho({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(PEDACO).map((p, k) => {
        const m = UMA.exec(p);
        if (!m) return <span key={k}>{p}</span>;
        return (
          <span key={k} className="cc-pil" data-n={Number(m[2]) % 3}>
            <span className="cc-seg">
              <span className="cc-ch">{'{{'}</span>
              <span className="cc-n">{m[1]}</span>
              <span className="cc-ch">::</span>
            </span>
            <span className="cc-resp">
              {m[3]}
              <span className="cc-ch">{'}}'}</span>
            </span>
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
  rotulo: string;
  placeholder?: string;
  refEl?: RefObject<HTMLTextAreaElement | null>;
  onEnter?: () => void;
  onSalvar?: () => void;
  onAcima?: () => void;
}

/** Ctrl Shift C: lacuna com o próximo número. Ctrl Alt C: outra lacuna com o mesmo número (iguais ao app). */
function Campo(p: CampoProps) {
  const interno = useRef<HTMLTextAreaElement>(null);
  const ref = p.refEl ?? interno;
  const pendente = useRef<[number, number] | null>(null);
  // O cursor volta ao lugar logo após o React redesenhar, antes da próxima tecla.
  useLayoutEffect(() => {
    if (pendente.current === null) return;
    ref.current?.setSelectionRange(...pendente.current);
    pendente.current = null;
  });
  const aoTecla = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const c = e.currentTarget;
    if (e.ctrlKey && e.code === 'KeyC' && (e.shiftKey || e.altKey)) {
      e.preventDefault();
      const r = insertCloze({ text: p.valor, start: c.selectionStart, end: c.selectionEnd }, e.altKey);
      pendente.current = [r.start, r.end];
      p.onChange(r.text);
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
        <Espelho texto={p.valor} />
      </div>
      <textarea
        ref={ref}
        rows={1}
        value={p.valor}
        placeholder={p.placeholder}
        aria-label={p.rotulo}
        spellCheck
        onKeyDown={aoTecla}
        onChange={(e) => p.onChange(e.target.value)}
      />
    </div>
  );
}

function Dicas({ teclas }: { teclas: [string, string][] }) {
  return (
    <p className="cc-dicas">
      {teclas.map(([k, t]) => (
        <span key={k}>
          <Key>{k}</Key>
          {t}
        </span>
      ))}
    </p>
  );
}

function Corpo({ estado, marca }: { estado: Estado; marca: Marca }) {
  const [t, setT] = useState(estado === 'vazio' ? '' : estado === 'simples' ? PERGUNTA : FRASE);
  const [v, setV] = useState(estado === 'simples' ? VERSO_TXT : '');
  const [salvos, setSalvos] = useState(0);
  const fref = useRef<HTMLTextAreaElement>(null);
  const vref = useRef<HTMLTextAreaElement>(null);
  const nums = clozeNumbers(t);
  const cloze = nums.length > 0;
  const pronto = cloze ? nums.length : t.trim() !== '' && v.trim() !== '' ? 1 : 0;
  const salvar = () => {
    if (pronto === 0) return;
    setSalvos((n) => n + pronto);
    setT('');
    setV('');
    fref.current?.focus();
  };
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
        <Button variant="primary" disabled={pronto === 0} onPress={salvar}>
          {pronto > 0 ? `Salvar ${pronto}` : 'Salvar'}
        </Button>
      </span>
    </>
  );
  return (
    <div className="cc-mesa" data-marca={marca}>
      <Block id="cc" title="Cartões" icon="cartoes" tools={tools} shortcut="Alt C" menu fixed="none">
        <div className={ed.editor}>
          {salvos > 0 && (
            <p className={ed.salvou}>
              {salvos} {salvos === 1 ? 'cartão salvo' : 'cartões salvos'}.
            </p>
          )}
          <article className={ed.carta}>
            <div className={`${ed.faixa} cc-sobre`}>
              <Campo
                rotulo="Frente"
                refEl={fref}
                valor={t}
                onChange={setT}
                placeholder="Pergunta, ou frase com lacuna"
                onEnter={() => vref.current?.focus()}
                onSalvar={salvar}
              />
            </div>
            <div className={ed.verso}>
              <Campo
                rotulo={cloze ? 'Extra' : 'Verso'}
                refEl={vref}
                valor={v}
                onChange={setV}
                placeholder={cloze ? 'Extra, se quiser' : 'Verso'}
                onAcima={() => fref.current?.focus()}
                onSalvar={salvar}
              />
            </div>
          </article>
          <Dicas teclas={[['Ctrl Shift C', 'nova lacuna'], ['Ctrl Alt C', 'mesmo número'], ['Ctrl Enter', 'salva']]} />
        </div>
      </Block>
    </div>
  );
}

export function Palco({ marca, titulo, nota }: { marca: Marca; titulo: string; nota: ReactNode }) {
  const [e, setE] = useState<Estado>(() => (new URLSearchParams(location.search).get('estado') as Estado | null) ?? 'cloze');
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
        <Corpo key={e} estado={e} marca={marca} />
        <div className="cc-nota">{nota}</div>
      </div>
    </section>
  );
}
