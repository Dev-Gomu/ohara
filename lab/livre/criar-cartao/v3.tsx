// C · Escreve a frase normal; Ctrl Shift C sem seleção abre as palavras: ← → anda, Espaço liga a lacuna.
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Bloco, Campo, Dicas, Palco, ed, useCartao, type Estado } from './_comum';
import { escrever, lerPalavras, palavraNoCursor, type Palavra } from './_palavras';

function Palavras({
  lista,
  cur,
  onEscolher,
}: {
  lista: Palavra[];
  cur: number;
  onEscolher: (i: number) => void;
}) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < lista.length; i++) {
    const w = (j: number) => {
      const p = lista[j];
      return p ? (
        <span key={j} className="cc-w" data-cur={j === cur} onClick={() => onEscolher(j)}>
          {p.texto}
          {lista[j + 1]?.marcada && p.marcada ? p.cauda : ''}
        </span>
      ) : null;
    };
    const p = lista[i];
    if (!p?.marcada) {
      out.push(w(i), `${p?.cauda ?? ''} `);
      continue;
    }
    let fim = i;
    while (lista[fim + 1]?.marcada) fim++;
    const grupo: React.ReactNode[] = [];
    for (let j = i; j <= fim; j++) grupo.push(w(j), j < fim ? ' ' : '');
    out.push(
      <span key={`g${i}`} className="cc-grupo">
        {grupo}
      </span>,
      `${lista[fim]?.cauda ?? ''} `,
    );
    i = fim;
  }
  return <>{out}</>;
}

function Corpo({ estado }: { estado: Estado }) {
  const c = useCartao(estado);
  const [modo, setModo] = useState(estado === 'cloze');
  const [cur, setCur] = useState(1);
  const pref = useRef<HTMLParagraphElement>(null);
  const lista = lerPalavras(c.t);

  useEffect(() => {
    if (modo) pref.current?.focus();
    else c.fref.current?.focus();
  }, [modo, c.fref]);

  const alternar = (i: number) => {
    const nova = lista.map((p, j) => (j === i ? { ...p, marcada: !p.marcada } : p));
    c.setT(escrever(nova));
  };
  const aoTecla = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setCur((n) => Math.min(n + 1, lista.length - 1));
    else if (e.key === 'ArrowLeft') setCur((n) => Math.max(n - 1, 0));
    else if (e.code === 'Space') alternar(cur);
    else if (e.key === 'Enter' && e.ctrlKey) {
      setModo(false);
      c.salvar();
    } else if (e.key === 'Enter' || (e.ctrlKey && e.code === 'KeyC')) setModo(false);
    else return;
    e.preventDefault();
  };
  const cloze = modo || c.tipo === 'cloze';
  const dicas = modo
    ? [
        ['← →', 'palavra'],
        ['Espaço', 'lacuna'],
        ['Enter', 'volta a escrever'],
      ]
    : cloze
      ? [
          ['Ctrl Shift C', 'escolher lacunas'],
          ['Ctrl Enter', 'salva'],
        ]
      : [
          ['Enter', 'verso'],
          ['Ctrl Shift C', 'escolher lacunas'],
          ['Ctrl Enter', 'salva'],
        ];

  return (
    <Bloco
      pronto={c.pronto}
      salvos={c.salvos}
      onSalvar={c.salvar}
      dicas={
        <Dicas teclas={dicas as [string, string][]}>
          {modo && <span>Vizinhas marcadas viram uma lacuna só.</span>}
        </Dicas>
      }
    >
      <article className={cloze ? 'cc-cloze' : ed.carta} data-tipo={cloze ? 'cloze' : c.tipo}>
        <div className={`${cloze ? 'cc-face' : ed.faixa} cc-sobre`}>
          {modo ? (
            <p
              ref={pref}
              className="cc-palavras"
              tabIndex={0}
              onKeyDown={aoTecla}
              aria-label="Escolher lacunas"
            >
              <Palavras
                lista={lista}
                cur={cur}
                onEscolher={(i) => {
                  setCur(i);
                  alternar(i);
                }}
              />
            </p>
          ) : (
            <Campo
              rotulo="Frente"
              refEl={c.fref}
              valor={c.t}
              onChange={c.setT}
              placeholder="Pergunta, ou frase para lacunas"
              onEnter={() => c.vref.current?.focus()}
              onSalvar={c.salvar}
              onLacunaSemSelecao={(caret) => {
                if (c.t.trim() === '') return false;
                setCur(Math.min(palavraNoCursor(c.t, caret), lista.length - 1));
                setModo(true);
                return true;
              }}
            />
          )}
        </div>
        <div className={cloze ? 'cc-baixo' : ed.verso}>
          {cloze && <span className="cc-rotulo">Extra</span>}
          <Campo
            rotulo={cloze ? 'Extra' : 'Verso'}
            refEl={c.vref}
            valor={c.v}
            onChange={c.setV}
            placeholder={cloze ? 'Opcional: aparece depois de virar' : 'Verso'}
            onAcima={() => c.fref.current?.focus()}
            onSalvar={c.salvar}
          />
          {cloze && (
            <p className="cc-gera">
              Vira {c.nums.length} {c.nums.length === 1 ? 'cartão' : 'cartões'}
              {c.nums.map((n) => (
                <span key={n} className="cc-num">
                  c{n}
                </span>
              ))}
            </p>
          )}
        </div>
      </article>
    </Bloco>
  );
}

export default function V3() {
  return (
    <Palco
      titulo="C · Lacunas pelas palavras"
      Corpo={Corpo}
      nota={
        <>
          <p>
            Escreva a frase sem chaves. <b>Ctrl Shift C</b> sem seleção abre as palavras já na
            palavra do cursor: ← → anda, <b>Espaço</b> liga ou tira a lacuna, Enter volta a
            escrever.
          </p>
          <p>
            Com texto selecionado, Ctrl Shift C faz a lacuna direto, como no app. A forma muda como
            na A.
          </p>
          <p>
            Prós: ninguém digita {'{{c1::}}'}; bom no tablet (toque na palavra). Contra: um modo a
            mais para aprender.
          </p>
        </>
      }
    />
  );
}
