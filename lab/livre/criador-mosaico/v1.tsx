// V1 · Linha cheia com traço de 1.5 px (contorno e linha iguais, azul suavizado).
import { Cartao } from './_cartao';
import { Quadro, useCriador } from './_comum';

export default function V1() {
  const c = useCriador();
  return (
    <Quadro
      c={c}
      nota="V1 Traço de 1,5 px. Um passo acima do atual (1 px). A favor: já tira o ar de fio de cabelo sem mudar o caráter do cartão. Contra: a diferença é pequena."
      caminho={[
        ['Enter', 'frente → verso, linha nova'],
        ['Ctrl ⇧ C', 'lacuna'],
        ['Ctrl Enter', 'salva'],
      ]}
    >
      <Cartao c={c} modo="linha" contorno divisao="linha-cheia" traco={1.5} />
    </Quadro>
  );
}
