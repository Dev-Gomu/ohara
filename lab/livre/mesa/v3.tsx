// V3 · Mínima: alternadores só com ícone, um menu e título em letra menor (cabe mais nome).
import { Blocos, Tela, Topo } from './_partes';

export default function V3() {
  return (
    <Tela topo={<Topo alternadores="so-icones" fim="menu" fonte="var(--voz-mini)" />}>
      <Blocos />
    </Tela>
  );
}
