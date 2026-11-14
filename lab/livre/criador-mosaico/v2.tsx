// V2 · Linha cheia com traço de 2 px (contorno e linha iguais, azul suavizado).
import { Cartao } from './_cartao';
import { Quadro, useCriador } from './_comum';

export default function V2() {
  const c = useCriador();
  return (
    <Quadro
      c={c}
      nota="V2 Traço de 2 px. Mesma espessura dos ícones do app. A favor: conversa com o resto da tela e fica macio. Contra: nenhum relevante."
      caminho={[
        ['Enter', 'frente → verso, linha nova'],
        ['Ctrl ⇧ C', 'lacuna'],
        ['Ctrl Enter', 'salva'],
      ]}
    >
      <Cartao c={c} modo="linha" contorno divisao="linha-cheia" traco={2} />
    </Quadro>
  );
}
