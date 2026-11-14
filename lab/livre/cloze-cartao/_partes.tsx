// Bancada "cloze-cartao" (rodada 14): o cloze com a cara do cartão simples: uma peça só, faixa azul com o texto em negrito
// (letra de voz) e corpo claro em letra de leitura. O "[…]" é o definido: azul-gelo e negrito. Frente e verso do mesmo tamanho (4:3).
import type { ReactNode } from 'react';
import './cloze.css';

export type Var = 'resposta' | 'completa' | 'revela';

const Lac = ({ aberta }: { aberta: boolean }) =>
  aberta ? <span className="cz-term">IL-6</span> : <span className="cz-oc">[…]</span>;

const Frase = ({ aberta }: { aberta: boolean }) => (
  <>A <Lac aberta={aberta} /> é produzida por macrófagos e induz a síntese de PCR no fígado.</>
);

function Cartao({ lado, v }: { lado: 'frente' | 'verso'; v: Var }) {
  const verso = lado === 'verso';
  return (
    <article className="cz-card">
      <div className="cz-faixa">
        <p><Frase aberta={verso && v === 'revela'} /></p>
      </div>
      <div className="cz-corpo">
        {!verso && <span className="cz-dica">Toque ou Espaço para revelar</span>}
        {verso && v === 'resposta' && <p className="cz-resp">IL-6</p>}
        {verso && v === 'completa' && <p className="cz-resp">A <b>IL-6</b> é produzida por macrófagos e induz a síntese de PCR no fígado.</p>}
        {verso && v === 'revela' && <p className="cz-resp"><b>IL-6</b></p>}
      </div>
    </article>
  );
}

export function Par({ v }: { v: Var }) {
  return (
    <div className="cz-par">
      <Cartao lado="frente" v={v} />
      <Cartao lado="verso" v={v} />
    </div>
  );
}

export function Sec({ t, children }: { t: string; children: ReactNode }) {
  return (
    <section className="cz-sec">
      <h2>{t}</h2>
      {children}
    </section>
  );
}
