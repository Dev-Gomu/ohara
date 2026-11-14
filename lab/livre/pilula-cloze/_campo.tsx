// Campo da faixa com a lacuna {{cN::resposta}} desenhada por baixo (espelho). Cada caractere mantém a largura
// do textarea, então a folga da pílula sai do espaço das chaves e dos dois-pontos (invisíveis) ou do fundo
// estendido sem ocupar lugar. O estilo de cada visual é só CSS, pela classe `estilo`.
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { insertCloze } from '../../../src/core/study/cardFormat';

const PEDACO = /(\{\{c\d+::.+?\}\})/g;
const UMA = /^\{\{(c(\d+))::(.+?)\}\}$/;

/** Lacuna sempre crua, como no editor do Anki. A chave de fora fica fora do miolo (vira moldura). */
function Lacuna({ n, num, resp }: { n: string; num: number; resp: string }) {
  return (
    <span className="pc-l" data-n={((num - 1) % 4) + 1}>
      <span className="pc-ch">{'{'}</span>
      <span className="pc-in">
        <span className="pc-ch">{'{'}</span>
        <span className="pc-n">{n}</span>
        <span className="pc-ch">::</span>
        <span className="pc-r">{resp}</span>
        <span className="pc-ch">{'}'}</span>
      </span>
      <span className="pc-ch">{'}'}</span>
    </span>
  );
}

function Espelho({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(PEDACO).map((p, k) => {
        const m = UMA.exec(p);
        return m ? (
          <Lacuna key={k} n={m[1] ?? ''} num={Number(m[2])} resp={m[3] ?? ''} />
        ) : (
          <span key={k}>{p}</span>
        );
      })}
      {texto.endsWith('\n') ? ' ' : ''}
    </>
  );
}

/** Ctrl Shift C: lacuna com o próximo número. Ctrl Alt C: mesmo número (iguais ao app). */
export function Campo({ inicial }: { inicial: string }) {
  const [valor, setValor] = useState(inicial);
  const ref = useRef<HTMLTextAreaElement>(null);
  const pendente = useRef<[number, number] | null>(null);
  useLayoutEffect(() => {
    if (pendente.current === null) return;
    ref.current?.setSelectionRange(...pendente.current);
    pendente.current = null;
  });
  const aoTecla = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const c = e.currentTarget;
    if (e.ctrlKey && e.code === 'KeyC' && (e.shiftKey || e.altKey)) {
      e.preventDefault();
      const r = insertCloze(
        { text: valor, start: c.selectionStart, end: c.selectionEnd },
        e.altKey,
      );
      pendente.current = [r.start, r.end];
      setValor(r.text);
    }
  };
  return (
    <div className="pc-campo">
      <div className="pc-espelho" aria-hidden="true">
        <Espelho texto={valor} />
      </div>
      <textarea
        ref={ref}
        rows={1}
        value={valor}
        aria-label="Frente"
        spellCheck
        onKeyDown={aoTecla}
        onChange={(e) => setValor(e.target.value)}
      />
    </div>
  );
}
