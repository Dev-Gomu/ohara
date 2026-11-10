// Cartão de próximas provas do Hub na Ardósia: três versões. A primeira prova é a mais próxima;
// a terceira está com o cursor do teclado.
import { SubjectPill } from '../../src/ui/components/Pill';
import { Ficha, Secao } from '../vitrine/moldura';

type Versao = 'a' | 'b' | 'c';

const USO: Record<Versao, string> = {
  a: 'Liso. Peça recuada, sem faixa. Só a prova mais próxima ganha a contagem em pílula cheia de ação.',
  b: 'Deitado. Dia e data lado a lado, contagem sempre em pílula no canto. Mais baixo: sobra altura para o resto do Hub.',
  c: 'Faixa em ilha. Mantém o desenho de hoje (faixa em cima, dia grande), mas a faixa vira uma ilha solta; a mais próxima fica cheia de ação.',
};

const PROVAS = [
  { dia: '17', sem: 'ter', mes: 'nov', falta: 'em 7 d', tipos: '', materias: [['GEN', 0]] },
  {
    dia: '21',
    sem: 'sáb',
    mes: 'nov',
    falta: 'em 11 d', tipos: 'T',
    materias: [
      ['IMU', 1],
      ['PRO', 2],
    ],
  },
  { dia: '24', sem: 'ter', mes: 'nov', falta: 'em 14 d', tipos: '', materias: [['PRO', 2]] },
  { dia: '30', sem: 'seg', mes: 'nov', falta: 'em 20 d', tipos: 'T · A', materias: [['APS', 3]] },
  { dia: '05', sem: 'sáb', mes: 'dez', falta: 'em 25 d', tipos: 'A', materias: [['FAR', 4]] },
] as const;

type Prova = (typeof PROVAS)[number];

// Pílula de tipo (D103): dia só de prova não leva marca; trabalho e apresentação entram
// numa pílula única com as iniciais.
function Tipos({ prova }: { prova: Prova }) {
  if (prova.tipos === '') return null;
  const nomes = prova.tipos.replace('T', 'Trabalho').replace('A', 'Apresentação');
  return (
    <span className="pv-tipos" title={nomes} aria-label={nomes}>
      {prova.tipos}
    </span>
  );
}

function Materias({ prova }: { prova: Prova }) {
  return (
    <span className="pv-materias">
      {prova.materias.map(([sigla, cor]) => (
        <SubjectPill key={sigla} code={sigla} color={cor} />
      ))}
    </span>
  );
}

function Cartao({ v, prova, i }: { v: Versao; prova: Prova; i: number }) {
  const estado = {
    'data-proxima': i === 0 ? '' : undefined,
    'data-cursor': i === 2 ? '' : undefined,
  };
  if (v === 'b') {
    return (
      <button type="button" tabIndex={-1} className="pv pv-b" {...estado}>
        <span className="pv-linha">
          <b className="pv-dia">{prova.dia}</b>
          <span className="pv-data">
            <span>{prova.sem}</span>
            <span>{prova.mes}</span>
          </span>
          <span className="pv-falta">{prova.falta}</span>
        </span>
        <span className="pv-pe">
          <Materias prova={prova} />
          <Tipos prova={prova} />
        </span>
      </button>
    );
  }
  return (
    <button type="button" tabIndex={-1} className={`pv pv-${v}`} {...estado}>
      <span className="pv-topo">
        <span>
          {prova.sem} · {prova.mes}
        </span>
        <span className="pv-falta">{prova.falta}</span>
      </span>
      <span className="pv-pe">
        <b className="pv-dia">{prova.dia}</b>
        <Tipos prova={prova} />
      </span>
      <Materias prova={prova} />
    </button>
  );
}

export function Provas() {
  return (
    <>
      <Secao>5. Cartão de próximas provas (Hub)</Secao>
      {(['a', 'b', 'c'] as const).map((v) => (
        <Ficha key={v} nome={`Prova ${v.toUpperCase()}`} arquivo="Hub" largura={12} uso={USO[v]}>
          <div className="pv-fila">
            {PROVAS.map((prova, i) => (
              <Cartao key={prova.dia} v={v} prova={prova} i={i} />
            ))}
          </div>
        </Ficha>
      ))}
    </>
  );
}
