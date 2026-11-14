// V2 · Tipo escolhido no topo: "Simples | Cloze". Cloze mostra frente (editável) e verso gerado lado a lado, com seletor da lacuna da vez.
import { useState } from 'react';
import { ClozeFace } from '../../../src/ui/components/CardBack';
import { expandCloze } from '../../../src/core/study/cloze';
import { Palco, Cru, FRASE, PERGUNTA, VersoSimples } from './_comum';

function Corpo({ e }: { e: 'vazio' | 'simples' | 'cloze' }) {
  const [vez, setVez] = useState(0);
  const cartoes = expandCloze(FRASE);
  const tipo = e === 'simples' ? 'simples' : 'cloze';
  return (
    <>
      <div className="cc-tipo" role="group" aria-label="Tipo de cartão">
        <span className="cc-rot">Tipo</span>
        <button data-on={tipo === 'simples'}>Cartão simples</button>
        <button data-on={tipo === 'cloze'}>Cloze (lacuna)</button>
      </div>
      {e === 'simples' ? (
        <div className="cc-simples">
          <div className="cc-faixa"><Cru texto={PERGUNTA} /></div>
          <VersoSimples />
        </div>
      ) : e === 'vazio' ? (
        <div className="cc-vazio"><b>Escreva a frase</b><span>Selecione um trecho e use Alt L para virar lacuna</span></div>
      ) : (
        <>
          <div className="cc-num" role="group" aria-label="Lacuna da vez">
            <span className="cc-rot">Mostrando</span>
            {cartoes.map((_, i) => <button key={i} data-on={vez === i} onClick={() => setVez(i)}>c{i + 1}</button>)}
          </div>
          <div className="cc-par">
            <div className="cc-frente"><Cru texto={FRASE} /></div>
            <ClozeFace text={cartoes[vez] ?? ''} side="verso" />
          </div>
          <p className="cc-dica"><span className="cc-tag">Esquerda: você escreve</span><span className="cc-tag">Direita: verso do cartão c{vez + 1}</span><span>Alt L cria a próxima lacuna.</span></p>
        </>
      )}
    </>
  );
}

export default function V2() {
  return <Palco titulo="V2 · Escolho o tipo no topo">{(e) => <Corpo e={e} />}</Palco>;
}
