// Base das 3 paletas: marca-texto Q2 (canto 2 px, respiro 4 px) na faixa azul e num cartão de fundo branco.
import ed from '../../../src/ui/screens/mesa/CardEditor.module.css';
import { Campo } from './_campo';
import './pc.css';

const FRASE =
  'A {{c1::IL-1}} e o {{c1::TNF-α}} causam febre; a {{c2::IL-6}} induz a síntese de {{c3::PCR}} e de {{c4::fibrinogênio}} no fígado.';

export function Versao({ faixa, titulo, nota }: { faixa: string; titulo: string; nota: string }) {
  return (
    <section className="pc">
      <h2>{titulo}</h2>
      <p className="pc-sub">{nota} Ctrl Shift C: lacuna nova · Ctrl Alt C: mesmo número.</p>
      <div className="pc-par" data-paleta-cloze="gelo" data-faixa={faixa}>
        <figure className="pc-item">
          <figcaption>Na faixa azul (como hoje)</figcaption>
          <article className={ed.carta}>
            <div className={`${ed.faixa} pc-sobre`}>
              <Campo inicial={FRASE} />
            </div>
            <div className={`${ed.verso} pc-verso`}>Extra, se quiser</div>
          </article>
        </figure>
        <figure className="pc-item">
          <figcaption>Com fundo branco (C1, aprovada)</figcaption>
          <article className={`${ed.carta} pc-branco`}>
            <div className="pc-frente-branca">
              <Campo inicial={FRASE} />
            </div>
            <div className={`${ed.verso} pc-verso`}>Extra, se quiser</div>
          </article>
        </figure>
      </div>
    </section>
  );
}
