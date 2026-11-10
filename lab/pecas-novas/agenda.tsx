// Célula de dia montada na tela da Agenda: semana (cabeça), mês e lista. ?v=a|b|c.
import { Ficha, Secao } from '../vitrine/moldura';
import { QUA, TER, type Evento } from './dados';
import { Cabeca, ListaLinha, Mes, type Versao } from './dia';

const SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
const HOJE = 10;
const ESCOLHIDO = 11;

const POR_DIA: Evento[][] = [
  [
    { hora: '08:00', code: 'GEN', color: 0 },
    { hora: '10:15', code: 'FIS', color: 6 },
    { hora: '14:00', code: 'PAT', color: 5 },
  ],
  TER,
  QUA,
  [
    { hora: '08:00', code: 'FAR', color: 4 },
    { hora: '10:15', code: 'FIS', color: 6 },
  ],
  [
    { hora: '08:00', code: 'GEN', color: 0 },
    { hora: '14:00', code: 'PAT', color: 5 },
  ],
  [],
  [],
];

// Novembro de 2026 começa num domingo: a grade abre em 26 de outubro.
function dias() {
  return Array.from({ length: 35 }, (_, i) => {
    const fora = i < 6;
    const numero = fora ? 26 + i : i - 5;
    return { i, numero, fora, semana: SEMANA[i % 7] ?? '', eventos: POR_DIA[i % 7] ?? [] };
  });
}

export function Agenda() {
  const v = (new URLSearchParams(location.search).get('v') ?? 'a') as Versao;
  const todos = dias();
  const lista = todos.filter((d) => !d.fora && d.numero >= HOJE && d.numero < HOJE + 7);
  return (
    <>
      <Secao>{`Dia ${v.toUpperCase()} na Agenda`}</Secao>
      <div className={`d-${v} v-12 ag-coluna`}>
        <Ficha nome="Semana" arquivo="cabeça das colunas" largura={12} uso="Só a cabeça; a grade de horas segue igual.">
          <div className="ag-semana">
            {SEMANA.map((s, i) => (
              <Cabeca key={s} v={v} semana={s} numero={9 + i} hoje={9 + i === HOJE} />
            ))}
          </div>
        </Ficha>
      </div>
      <div className={`d-${v} v-8`}>
        <Ficha nome="Mês" arquivo="novembro" largura={12} uso="Hoje é 10; 11 está escolhido, com o cursor.">
          <div className="ag-mes">
            {SEMANA.map((s) => (
              <span key={s} className="ag-dsem">
                {s}
              </span>
            ))}
            {todos.map((d) => (
              <Mes
                key={d.i}
                v={v}
                semana=""
                numero={d.numero}
                fora={d.fora}
                hoje={!d.fora && d.numero === HOJE}
                sel={!d.fora && d.numero === ESCOLHIDO}
                eventos={d.fora ? [] : d.eventos}
              />
            ))}
          </div>
        </Ficha>
      </div>
      <div className={`d-${v} v-4`}>
        <Ficha nome="Lista" arquivo="7 dias" largura={12} uso="A mesma célula, deitada.">
          <div className="ag-lista">
            {lista.map((d) => (
              <ListaLinha
                key={d.i}
                v={v}
                semana={d.semana}
                numero={d.numero}
                hoje={d.numero === HOJE}
                sel={d.numero === ESCOLHIDO}
                eventos={d.eventos}
              />
            ))}
          </div>
        </Ficha>
      </div>
    </>
  );
}
