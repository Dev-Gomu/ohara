// V3 · Linha cheia com traço de 3 px (contorno e linha iguais, azul suavizado).
import { Cartao } from './_cartao';
import { Quadro, useCriador } from './_comum';

export default function V3() {
  const c = useCriador();
  return (
    <Quadro
      c={c}
      nota="V3 Traço de 3 px. Mesma espessura do cursor de bloco. A favor: a mais macia e presente. Contra: em bloco pequeno começa a competir com o texto e pode ser confundida com o cursor."
      caminho={[
        ['Enter', 'frente → verso, linha nova'],
        ['Ctrl ⇧ C', 'lacuna'],
        ['Ctrl Enter', 'salva'],
      ]}
    >
      <Cartao c={c} modo="linha" contorno divisao="linha-cheia" traco={3} />
    </Quadro>
  );
}
