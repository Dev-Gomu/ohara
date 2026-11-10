// Mostrador de avaliações do Hub (provas, trabalhos, apresentações): conceito "Blocos de cor",
// escolhido na rodada 3, em três versões. Caso de teste: dia 17, com 3 provas e 1 trabalho.
// Hoje é terça, 10 de novembro. O primeiro dia é o mais próximo; o segundo está com o cursor.
import { Ficha, Secao } from '../vitrine/moldura';

type Materia = readonly [sigla: string, cor: number];

interface Dia {
  sem: string;
  dia: string;
  mes: string;
  faltam: number;
  provas: readonly Materia[];
  trabalhos: readonly Materia[];
  apresentacoes: readonly Materia[];
}

const GEN: Materia = ['GEN', 0];
const IMU: Materia = ['IMU', 1];
const PRO: Materia = ['PRO', 2];
const APS: Materia = ['APS', 3];
const FAR: Materia = ['FAR', 4];
const FIS: Materia = ['FIS', 5];

const DIAS: readonly Dia[] = [
  {
    sem: 'TER',
    dia: '17',
    mes: 'nov',
    faltam: 7,
    provas: [GEN, IMU, PRO],
    trabalhos: [FAR],
    apresentacoes: [],
  },
  {
    sem: 'SÁB',
    dia: '21',
    mes: 'nov',
    faltam: 11,
    provas: [],
    trabalhos: [PRO],
    apresentacoes: [APS],
  },
  {
    sem: 'TER',
    dia: '24',
    mes: 'nov',
    faltam: 14,
    provas: [FIS],
    trabalhos: [],
    apresentacoes: [],
  },
  {
    sem: 'SEG',
    dia: '30',
    mes: 'nov',
    faltam: 20,
    provas: [],
    trabalhos: [],
    apresentacoes: [APS],
  },
  {
    sem: 'SÁB',
    dia: '05',
    mes: 'dez',
    faltam: 25,
    provas: [FAR, GEN],
    trabalhos: [],
    apresentacoes: [],
  },
  {
    sem: 'QUI',
    dia: '10',
    mes: 'dez',
    faltam: 30,
    provas: [],
    trabalhos: [FIS],
    apresentacoes: [],
  },
];

const cursor = (ligado: boolean) => ({ 'data-cursor': ligado ? '' : undefined });

const TIPOS = [
  { chave: 'provas', curto: 'prova' },
  { chave: 'trabalhos', curto: 'trabalho' },
  { chave: 'apresentacoes', curto: 'apres.' },
] as const;

type Versao = 'a1' | 'a2' | 'a3';

function Tijolos({ dia }: { dia: Dia }) {
  return (
    <span className="av-tijolos">
      {TIPOS.flatMap((tipo) =>
        dia[tipo.chave].map(([sigla, cor]) => (
          <span key={tipo.chave + sigla} className="av-tijolo" data-materia={cor} data-prova={tipo.chave === 'provas'}>
            <b>
              <i />
              {sigla}
            </b>
            <span>{tipo.curto}</span>
          </span>
        )),
      )}
    </span>
  );
}

function Blocos({ v }: { v: Versao }) {
  return (
    <div className={`av-rolo av-${v}`}>
      {DIAS.map((dia, i) => (
        <button
          key={dia.dia}
          type="button"
          tabIndex={-1}
          className="av-grupo"
          data-proxima={i === 0 ? '' : undefined}
          {...cursor(i === 1)}
        >
          {v === 'a3' ? (
            <span className="av-lado">
              <b className="av-numero">{dia.dia}</b>
              <span className="av-lado-texto">
                <span>
                  {dia.sem} · {dia.mes}
                </span>
                <span className="av-quanto">em {dia.faltam} d</span>
              </span>
            </span>
          ) : (
            <span className="av-cab">
              <b>
                {dia.sem} {dia.dia}
              </b>
              <span className="av-quanto">em {dia.faltam} d</span>
            </span>
          )}
          <Tijolos dia={dia} />
        </button>
      ))}
    </div>
  );
}

const VERSOES: readonly { v: Versao; nome: string; uso: string }[] = [
  {
    v: 'a1',
    nome: 'Blocos A1 · Cheios',
    uso: 'Como na rodada anterior, arrumado: cada dia é uma peça recuada, com os blocos cheios da cor da matéria. O dia mais próximo leva a contagem em pílula azul.',
  },
  {
    v: 'a2',
    nome: 'Blocos A2 · Calmos',
    uso: 'Blocos neutros; a cor da matéria fica só na marca ao lado da sigla. Muito menos cor na tela, mesma leitura.',
  },
  {
    v: 'a3',
    nome: 'Blocos A3 · Dia grande, prova pesa mais',
    uso: 'O número do dia volta a ser a âncora, à esquerda. Prova é bloco cheio; trabalho e apresentação são blocos claros, então a prova salta primeiro.',
  },
];

export function Avaliacoes() {
  return (
    <>
      <Secao>7. Mostrador de provas, trabalhos e apresentações (Hub): Blocos de cor</Secao>
      {VERSOES.map(({ v, nome, uso }) => (
        <Ficha key={v} nome={nome} arquivo="Hub" largura={12} uso={uso}>
          <Blocos v={v} />
        </Ficha>
      ))}
    </>
  );
}
