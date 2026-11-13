// V2 · Um menu: alternadores com ícone e letra; Faltas, Notas e ajuda num botão só.
import { Blocos, Tela, Topo } from './_partes';

export default function V2() {
  return (
    <Tela topo={<Topo alternadores="icones" fim="menu" />}>
      <Blocos />
    </Tela>
  );
}
