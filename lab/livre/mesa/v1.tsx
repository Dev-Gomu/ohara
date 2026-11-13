// V1 · Dois ícones: alternadores com ícone e letra; Faltas, Notas e ajuda viram ícones.
import { Blocos, Tela, Topo } from './_partes';

export default function V1() {
  return (
    <Tela topo={<Topo alternadores="icones" fim="icones" />}>
      <Blocos />
    </Tela>
  );
}
