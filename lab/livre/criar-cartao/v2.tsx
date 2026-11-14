// B · A forma nunca muda (faixa + verso). No cloze o verso mostra os cartões que vão sair, como uma seção.
import { expandCloze } from '../../../src/core/study/cloze';
import { Inline } from '../../../src/ui/components/CardBack';
import { Bloco, Campo, Dicas, Palco, ed, useCartao, type Estado } from './_comum';

function Corpo({ estado }: { estado: Estado }) {
  const c = useCartao(estado);
  const cloze = c.tipo === 'cloze';
  const dicas = cloze
    ? [
        ['Ctrl Shift C', 'outra lacuna'],
        ['Ctrl Alt C', 'no mesmo cartão'],
        ['Ctrl Enter', 'salva'],
      ]
    : [
        ['Enter', 'verso'],
        ['Ctrl Shift C', 'lacuna'],
        ['Ctrl Enter', 'salva'],
      ];
  return (
    <Bloco
      pronto={c.pronto}
      salvos={c.salvos}
      onSalvar={c.salvar}
      dicas={<Dicas teclas={dicas as [string, string][]} />}
    >
      <article className={ed.carta} data-tipo={c.tipo}>
        <div className={`${ed.faixa} cc-sobre`}>
          <Campo
            rotulo="Frente"
            refEl={c.fref}
            valor={c.t}
            onChange={c.setT}
            placeholder="Pergunta, ou frase com lacuna"
            onEnter={() => c.vref.current?.focus()}
            onSalvar={c.salvar}
          />
        </div>
        <div className={ed.verso}>
          {cloze && (
            <>
              <h3 className={`${ed.titulo} cc-titulo`}>
                Vira {c.nums.length} {c.nums.length === 1 ? 'cartão' : 'cartões'}
              </h3>
              {expandCloze(c.t).map((x, i) => (
                <p key={i} className="cc-ger">
                  <span className="cc-num">c{c.nums[i]}</span>
                  <span>
                    <Inline text={x} cloze="revela" />
                  </span>
                </p>
              ))}
              <h3 className={`${ed.titulo} cc-titulo`}>Extra</h3>
            </>
          )}
          <Campo
            rotulo={cloze ? 'Extra' : 'Verso'}
            refEl={c.vref}
            valor={c.v}
            onChange={c.setV}
            placeholder={cloze ? 'Opcional: aparece depois de virar' : 'Verso'}
            onAcima={() => c.fref.current?.focus()}
            onSalvar={c.salvar}
          />
        </div>
      </article>
    </Bloco>
  );
}

export default function V2() {
  return (
    <Palco
      titulo="B · Mesma forma, verso se escreve"
      Corpo={Corpo}
      nota={
        <>
          <p>
            O cartão novo é sempre faixa azul + verso, como hoje. Com uma lacuna, o verso ganha a
            seção <b>Vira 2 cartões</b>: cada linha mostra a frase com a resposta da vez em azul.
          </p>
          <p>
            Embaixo fica o <b>Extra</b> opcional, que hoje se perde no cloze.
          </p>
          <p>
            Prós: nada pula, e você confere cada cartão antes de salvar. Contra: o editor não se
            parece com o cloze do Treino.
          </p>
        </>
      }
    />
  );
}
