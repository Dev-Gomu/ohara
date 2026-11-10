// Célula de dia da Agenda em três lugares: cabeça da semana, quadro do mês, linha da lista.
// Estados: hoje (ter 10), escolhido com cursor (qua 11) e dia comum (qui 12).
import { SubjectPill } from '../../src/ui/components/Pill';
import { Amostra, Ficha, Linha, Secao } from '../vitrine/moldura';
import { QUA, TER, type Evento } from './dados';

export type Versao = 'a' | 'b' | 'c';

const USO: Record<Versao, string> = {
  a: 'Número em voz. Hoje é o número dentro da pílula cheia de ação; eventos com a pílula da matéria.',
  b: 'Pílula do dia. Dia e número numa pílula só; eventos com a marca alongada da matéria.',
  c: 'Etiqueta tingida. Cada evento é uma faixa curta na cor da matéria; hoje acende o número.',
};

interface DiaProps {
  v: Versao;
  semana: string;
  numero: number;
  hoje?: boolean;
  sel?: boolean;
  fora?: boolean;
  eventos: Evento[];
}

export function Cabeca({ v, semana, numero, hoje }: Omit<DiaProps, 'eventos'>) {
  if (v === 'b') {
    return (
      <span className="d-cabeca" data-hoje={hoje}>
        {semana} {numero}
      </span>
    );
  }
  return (
    <span className="d-cabeca" data-hoje={hoje}>
      <small>{semana}</small>
      <b>{numero}</b>
    </span>
  );
}

export function Eventos({ v, eventos, max }: { v: Versao; eventos: Evento[]; max: number }) {
  const resto = eventos.length - max;
  return (
    <>
      {eventos.slice(0, max).map((e) => (
        <span key={e.hora} className="d-evento" data-materia={e.color}>
          {v === 'a' && <SubjectPill code={e.code} color={e.color} />}
          {v === 'b' && <i className="d-marca" />}
          {v !== 'a' && <b>{e.code}</b>}
          <span>{e.prova ? `Prova ${e.hora}` : e.hora}</span>
        </span>
      ))}
      {resto > 0 && <span className="d-mais">+{resto}</span>}
    </>
  );
}

export function Mes(p: DiaProps) {
  return (
    <div className="d-mes" data-fora={p.fora} data-sel={p.sel} data-cursor={p.sel ? '' : undefined}>
      <Cabeca {...p} />
      <Eventos v={p.v} eventos={p.eventos} max={3} />
    </div>
  );
}

export function ListaLinha(p: DiaProps) {
  return (
    <div className="d-linha" data-sel={p.sel} data-cursor={p.sel ? '' : undefined}>
      <Cabeca {...p} />
      <div className="d-eventos">
        <Eventos v={p.v} eventos={p.eventos} max={6} />
      </div>
    </div>
  );
}

export function Dia() {
  return (
    <>
      <Secao>2. Célula de dia (semana, mês, lista)</Secao>
      {(['a', 'b', 'c'] as const).map((v) => (
        <Ficha key={v} nome={`Dia ${v.toUpperCase()}`} arquivo="Agenda" largura={12} uso={USO[v]}>
          <div className={`d-${v}`}>
            <Linha>
              <Amostra estado="cabeça da semana">
                <div className="d-semana">
                  <Cabeca v={v} semana="SEG" numero={9} />
                  <Cabeca v={v} semana="TER" numero={10} hoje />
                  <Cabeca v={v} semana="QUA" numero={11} />
                </div>
              </Amostra>
            <Amostra estado="mês: hoje · escolhido com cursor · comum">
              <div className="d-grade">
                <Mes v={v} semana="TER" numero={10} hoje eventos={TER} />
                <Mes v={v} semana="QUA" numero={11} sel eventos={QUA} />
                <Mes v={v} semana="QUI" numero={12} eventos={[]} />
              </div>
            </Amostra>
            <Amostra estado="lista: hoje · escolhido com cursor">
              <div className="d-lista">
                <ListaLinha v={v} semana="TER" numero={10} hoje eventos={TER} />
                <ListaLinha v={v} semana="QUA" numero={11} sel eventos={QUA} />
              </div>
            </Amostra>
            </Linha>
          </div>
        </Ficha>
      ))}
    </>
  );
}
