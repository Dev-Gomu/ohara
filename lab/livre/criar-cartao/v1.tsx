// V1 · O cartão muda sozinho: começa neutro; ao escrever "{{c1::" ele vira o cartão cloze (só a frase).
import { Palco, Cru, FRASE, PERGUNTA, VersoSimples } from './_comum';
import { clozeNumbers } from '../../../src/core/study/cloze';

export default function V1() {
  return (
    <Palco titulo="V1 · O cartão muda sozinho" inicial="cloze">
      {(e) => {
        if (e === 'vazio')
          return (
            <>
              <div className="cc-vazio">
                <b>Escreva a pergunta</b>
                <span>ou uma frase com lacuna</span>
              </div>
              <p className="cc-dica"><span className="cc-tag">@ pergunta</span><span className="cc-tag">{'{{c1::resposta}}'} lacuna</span><span>O formato do cartão aparece conforme você escreve.</span></p>
            </>
          );
        if (e === 'simples')
          return (
            <div className="cc-simples">
              <div className="cc-faixa"><Cru texto={PERGUNTA} /></div>
              <VersoSimples />
            </div>
          );
        return (
          <>
            <div className="cc-frente"><Cru texto={FRASE} /></div>
            <p className="cc-dica">
              <span className="cc-tag">Cloze</span>
              <span>{clozeNumbers(FRASE).length} cartões saem desta frase:</span>
              {clozeNumbers(FRASE).map((n) => <span key={n} className="cc-tag">c{n}</span>)}
              <span>O verso é gerado, não precisa escrever.</span>
            </p>
          </>
        );
      }}
    </Palco>
  );
}
