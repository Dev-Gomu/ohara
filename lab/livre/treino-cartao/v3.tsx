// Rodada 6 (estilo Anki: ao revelar, a pergunta fica no topo da tela). V3 · Dois cartões, frente suave: como a V1, mas a pergunta em cima fica em tom suave.
import { Ref } from './_ref';

export default function V3() {
  return <Ref frente="forte" pecas={false} topo="suave" />;
}
