// Cartão pronto (base escolhida em 14/11) em três doses de simplicidade.
// `modo`: o lado inteiro vira texto com o cursor, ou só a linha. `icones`: Lacuna e Imagem no canto.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { clozeNumbers } from '../../../src/core/study/cloze';
import { CardBack } from '../../../src/ui/components/CardBack';
import { ImageIcon } from '../../../src/ui/components/CardImages';
import cb from '../../../src/ui/components/CardBack.module.css';
import { Campo, type Criador } from './_comum';

// Verso linha a linha: tudo pronto, menos a linha onde o cursor está.
function Linhas({ c }: { c: Criador }) {
  const linhas = c.rasc.verso.split('\n');
  const [escolhida, setEscolhida] = useState(0);
  const ativa = Math.min(escolhida, linhas.length - 1);
  const caixa = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const cursor = useRef<number | null>(null);
  const noVerso = c.lado === 'verso';

  useLayoutEffect(() => {
    const a = area.current;
    if (!a) return;
    a.style.height = 'auto';
    a.style.height = `${a.scrollHeight}px`;
  });
  useEffect(() => {
    if (!noVerso) return;
    area.current?.focus();
    if (cursor.current !== null) area.current?.setSelectionRange(cursor.current, cursor.current);
    cursor.current = null;
  }, [noVerso, ativa]);

  const gravar = (novas: string[]) => c.setRasc({ ...c.rasc, verso: novas.join('\n') });
  const ir = (indice: number, posicao: number | null = null) => {
    cursor.current = posicao;
    setEscolhida(indice);
  };

  const teclas = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey) return;
    const a = e.currentTarget;
    const atual = linhas[ativa] ?? '';
    if (e.code === 'Enter') {
      const p = a.selectionStart;
      gravar([
        ...linhas.slice(0, ativa),
        atual.slice(0, p),
        atual.slice(p),
        ...linhas.slice(ativa + 1),
      ]);
      ir(ativa + 1, 0);
    } else if (
      e.code === 'Backspace' &&
      a.selectionStart === 0 &&
      a.selectionEnd === 0 &&
      ativa > 0
    ) {
      const anterior = linhas[ativa - 1] ?? '';
      gravar([...linhas.slice(0, ativa - 1), anterior + atual, ...linhas.slice(ativa + 1)]);
      ir(ativa - 1, anterior.length);
    } else if (e.code === 'ArrowUp') {
      if (ativa === 0) c.setLado('frente');
      else ir(ativa - 1);
    } else if (e.code === 'ArrowDown' && ativa < linhas.length - 1) ir(ativa + 1);
    else return;
    e.preventDefault();
  };

  // Ao trocar de linha o campo é recriado: só solta o cursor se o foco saiu mesmo do verso.
  const aoSair = () =>
    requestAnimationFrame(() => {
      if (!caixa.current?.contains(document.activeElement))
        c.setLado((l) => (l === 'verso' ? null : l));
    });

  return (
    <div
      ref={caixa}
      className="cm-linhas"
      tabIndex={noVerso ? -1 : 0}
      onFocus={() => !noVerso && c.setLado('verso')}
    >
      {linhas.map((linha, i) => {
        if (noVerso && i === ativa) {
          return (
            <div key={i} className="cm-ativa">
              <textarea
                ref={area}
                rows={1}
                className="cm-campo"
                value={linha}
                placeholder={linhas.length === 1 ? (c.cloze ? 'Extra (opcional)' : 'Resposta') : ''}
                aria-label="Linha do verso"
                spellCheck={false}
                onChange={(e) => gravar(linhas.map((l, n) => (n === i ? e.target.value : l)))}
                onKeyDown={teclas}
                onBlur={aoSair}
              />
            </div>
          );
        }
        const vazia = linha.trim() === '';
        if (vazia && linhas.length > 1 && i === linhas.length - 1) return null;
        return (
          <div
            key={i}
            className="cm-linha"
            data-titulo={linha.startsWith('#') ? '' : undefined}
            onMouseDown={(e) => {
              e.preventDefault();
              ir(i);
              c.setLado('verso');
            }}
          >
            {vazia ? (
              <p className="cm-dica">{linhas.length === 1 ? (c.cloze ? 'Extra (opcional)' : 'Resposta') : ' '}</p>
            ) : (
              <CardBack back={linha} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const LacunaIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 5H5v14h3M16 5h3v14h-3M9 12h.01M12 12h.01M15 12h.01" />
  </svg>
);

interface CartaoProps {
  c: Criador;
  modo?: 'lado' | 'linha';
  icones?: boolean;
  contorno?: boolean;
  lacuna?: 'suave' | 'forte';
  traco?: number;
  divisao?: 'rotulos' | 'recuo' | 'faixa' | 'linha-cheia' | 'linha-recuada' | 'linha-tracejada';
}

export function Cartao({ c, modo = 'lado', icones, contorno, lacuna: tom = 'suave', divisao, traco }: CartaoProps) {
  const teclas = (evento: React.KeyboardEvent) => {
    if (c.teclas(evento)) return;
    if (evento.code === 'Enter' && !evento.shiftKey && c.lado === 'frente') {
      c.setLado('verso');
      evento.preventDefault();
    } else if (evento.code === 'Escape') c.setLado(null);
  };

  // Pelo dedo: com o cursor na frente envolve a seleção; fora dela, abre uma lacuna no fim da frase.
  const lacuna = () => {
    if (c.lado === 'frente') return c.lacuna();
    const abre = `{{c${Math.max(0, ...clozeNumbers(c.rasc.frente)) + 1}::`;
    const frente = `${c.rasc.frente}${abre}}}`;
    c.setRasc({ ...c.rasc, frente });
    c.setLado('frente');
    const p = frente.length - 2;
    setTimeout(() => c.campo.current?.setSelectionRange(p, p), 30);
  };

  return (
    <article className={`${cb.carta} cm-carta ${contorno ? 'cm-contorno' : ''}`} data-lac={tom} data-div={divisao} data-traco={traco ? '' : undefined} style={traco ? ({ '--cm-traco': `${traco}px` } as React.CSSProperties) : undefined} onKeyDown={teclas}>
      <div className={`${cb.frente} cm-frente`}>
        {divisao === 'rotulos' && <span className="cm-nome">Frente</span>}
        <Campo c={c} qual="frente" dica="Pergunta, ou frase com lacuna" pilulas={contorno} />
      </div>
      <div className={`${cb.verso} cm-verso`}>
        {divisao === 'rotulos' && <span className="cm-nome">Verso</span>}
        {modo === 'linha' ? (
          <Linhas c={c} />
        ) : (
          <Campo c={c} qual="verso" dica={c.cloze ? 'Extra (opcional)' : 'Resposta'} />
        )}
        {icones && (
          <span className="cm-canto" onMouseDown={(e) => e.preventDefault()}>
            <button
              type="button"
              aria-label="Nova lacuna"
              title="Nova lacuna · Ctrl Shift C"
              onClick={lacuna}
            >
              <LacunaIcon />
            </button>
            <button type="button" aria-label="Anexar imagem" title="Anexar imagem">
              <ImageIcon plus />
            </button>
          </span>
        )}
      </div>
    </article>
  );
}
