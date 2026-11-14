import { Palco } from './_comum';

export default function V2() {
  return <Palco marca="cru" titulo="P1 · Texto cru marcado" nota={<p>Mostra <b>tudo o que está escrito</b>: {'{{c1::IL-1}}'}. As chaves ficam bem apagadas, o número e a resposta fortes. É o mais fiel ao texto, igual ao que vai para o Anki.</p>} />;
}
