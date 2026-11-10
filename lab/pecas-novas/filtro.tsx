// Filtro de matérias da Agenda: uma escolha. Estado mostrado: IMU escolhida, cursor em PAT.
import { Ficha, Secao } from '../vitrine/moldura';
import { MATERIAS } from './dados';

type Versao = 'a' | 'b' | 'c';

const USO: Record<Versao, string> = {
  a: 'Grade de pílulas. Só a escolhida ganha a cor da matéria (como hoje, refinado).',
  b: 'Marca + sigla. A cor de cada matéria fica sempre à vista e serve de legenda da semana.',
  c: 'Bandeja recuada, como a ilha do topo. A escolhida vira a pílula colorida da matéria.',
};

function Grade({ v, escolhida, cursor }: { v: Versao; escolhida: string; cursor: string }) {
  const itens = [{ code: 'Todas', color: undefined }, ...MATERIAS];
  return (
    <div className={`f-${v}`} role="radiogroup" aria-label="Matérias">
      {itens.map(({ code, color }) => (
        <button
          key={code}
          type="button"
          tabIndex={-1}
          className="f-item"
          data-materia={color}
          data-sel={code === escolhida}
          data-cursor={code === cursor ? '' : undefined}
        >
          {v === 'b' && color !== undefined && <i className="f-marca" />}
          {code}
        </button>
      ))}
    </div>
  );
}

export function Filtro() {
  return (
    <>
      <Secao>1. Filtro de matérias (Agenda)</Secao>
      {(['a', 'b', 'c'] as const).map((v) => (
        <Ficha key={v} nome={`Filtro ${v.toUpperCase()}`} arquivo="Agenda" largura={4} uso={USO[v]}>
          <Grade v={v} escolhida="IMU" cursor="PAT" />
          <p className="v-legenda">nada escolhido:</p>
          <Grade v={v} escolhida="Todas" cursor="" />
        </Ficha>
      ))}
    </>
  );
}
