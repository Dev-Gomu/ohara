// Rodada 6 (estilo Anki: ao revelar, a pergunta fica no topo da tela). V2 · Texto solto: a pergunta vira título da tela, sem cartão; o verso vem no cartão abaixo.
import { Ref } from './_ref';

export default function V2() {
  return <Ref frente="forte" pecas={false} topo="texto" />;
}
