// A · O cartão muda de forma sozinho: com a primeira lacuna vira a face azul do cloze (como no Treino).
// A árvore é a mesma nos dois tipos, então o cursor não pula quando a forma muda.
import { Bloco, Campo, Dicas, Palco, ed, useCartao, type Estado } from './_comum';

function Corpo({ estado }: { estado: Estado }) {
  const c = useCartao(estado);
  const cloze = c.tipo === 'cloze';
  const dicas =
    c.tipo === 'cloze'
      ? [
          ['Ctrl Shift C', 'outra lacuna'],
          ['Ctrl Alt C', 'no mesmo cartão'],
          ['Ctrl Enter', 'salva'],
        ]
      : c.tipo === 'simples'
        ? [
            ['Enter', 'verso'],
            ['Ctrl Shift C', 'lacuna'],
            ['Ctrl Enter', 'salva'],
          ]
        : [
            ['Enter', 'verso'],
            ['Ctrl Shift C', 'lacuna: vira cloze'],
          ];
  return (
    <Bloco
      pronto={c.pronto}
      salvos={c.salvos}
      onSalvar={c.salvar}
      dicas={<Dicas teclas={dicas as [string, string][]} />}
    >
      <article className={cloze ? 'cc-cloze' : ed.carta} data-tipo={c.tipo}>
        <div className={`${cloze ? 'cc-face' : ed.faixa} cc-sobre`}>
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

export default function V1() {
  return (
    <Palco
      titulo="A · O cartão muda de forma"
      Corpo={Corpo}
      nota={
        <>
          <p>
            Começa como cartão de pergunta (faixa azul + verso). Na primeira lacuna (Ctrl Shift C),
            vira a <b>face azul cheia</b> do cloze, a mesma do Treino, e o verso vira <b>Extra</b>{' '}
            opcional.
          </p>
          <p>Apagou a última lacuna, volta a ser pergunta. Não há tipo para escolher.</p>
          <p>
            Prós: o que você vê é o que vai estudar. Contra: o cartão "pula" de tamanho na hora da
            lacuna.
          </p>
        </>
      }
    />
  );
}
