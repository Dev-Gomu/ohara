// Rodada 6 (estilo Anki: ao revelar, a pergunta fica no topo da tela). V1 · Dois cartões: a frente azul encolhe e fica em cima; o verso vem num cartão abaixo.
import { Ref } from './_ref';

export default function V1() {
  return <Ref frente="forte" pecas={false} topo="cartao" />;
}
