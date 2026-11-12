// Agenda de hoje do Hub: eixo de horas com blocos pela duração e linha da hora atual.
// A: a aula de agora é o único bloco cheio. B: todos neutros, só a pílula "agora". C: lista de hoje.
import type { CSSProperties } from 'react';
import { ListItem } from '../../src/ui/components/ListItem';
import { NowPill, SubjectPill } from '../../src/ui/components/Pill';
import { Ficha, Secao } from '../vitrine/moldura';

export interface Aula {
  ini: number;
  dur: number;
  hora: string;
  titulo: string;
  code: string;
  cor: number;
  passou?: boolean;
  agora?: boolean;
}

// Horas contadas a partir das 08:00; o eixo vai até as 18:00.
export const AULAS: readonly Aula[] = [
  { ini: 0, dur: 1.5, hora: '08:00–09:30', titulo: 'Expressão gênica', code: 'GEN', cor: 0, passou: true },
  { ini: 2, dur: 1.5, hora: '10:00–11:30', titulo: 'Territorialização', code: 'APS', cor: 3, passou: true },
  { ini: 5, dur: 2, hora: '13:00–15:00', titulo: 'Resposta inflamatória aguda', code: 'IMU', cor: 2, agora: true },
  { ini: 7.25, dur: 1.75, hora: '15:15–17:00', titulo: 'Exame do abdome', code: 'PRO', cor: 1 },
];

export const AGORA = 5 + 40 / 60;
const HORAS = [8, 10, 12, 14, 16, 18];

const USO = {
  a: 'Eixo de horas, blocos pela duração e linha de agora. A aula em andamento é o único bloco cheio, na cor da matéria.',
  b: 'Igual, mas todos os blocos ficam neutros. A aula em andamento leva só a pílula "agora" e a linha.',
  c: 'Lista como a do app hoje, para comparar. Sem eixo, sem linha; a duração só aparece no texto.',
};

function Eixo({ versao }: { versao: 'a' | 'b' }) {
  return (
    <div className={`hj-moldura hj-${versao}`}>
      {HORAS.filter((h) => Math.abs(h - 8 - AGORA) > 0.6).map((h) => (
        <span key={h} className="hj-eixo" style={{ top: `${((h - 8) / 10) * 100}%` }}>
          {String(h).padStart(2, '0')}:00
        </span>
      ))}
      {AULAS.map((aula) => {
        const agoraA = versao === 'a' && aula.agora;
        return (
          <div
            key={aula.code}
            className="hj-lugar"
            style={{ '--ini': aula.ini, '--dur': aula.dur } as CSSProperties}
          >
            <div
              className="hj-aula"
              data-materia={aula.cor}
              data-agora={aula.agora ?? false}
              data-passou={aula.passou ?? false}
              data-sel={versao === 'b' && aula.agora}
            >
              <span className="hj-tit">{aula.titulo}</span>
              <span className="hj-fim">
                <span>{aula.hora}</span>
                {agoraA ? (
                  <>
                    <span className="hj-tinta">agora</span>
                    <span className="hj-tinta">{aula.code}</span>
                  </>
                ) : (
                  <>
                    {aula.agora && <NowPill />}
                    <SubjectPill code={aula.code} color={aula.cor} />
                  </>
                )}
              </span>
            </div>
          </div>
        );
      })}
      <span className="hj-linha" style={{ '--ini': AGORA } as CSSProperties} />
      <span className="hj-agora" style={{ '--ini': AGORA } as CSSProperties}>
        13:40
      </span>
    </div>
  );
}

function Lista() {
  return (
    <div className="hj-lista">
      {AULAS.map((aula) => (
        <ListItem
          key={aula.code}
          time={aula.hora}
          title={aula.titulo}
          past={aula.passou ?? false}
          selected={aula.agora ?? false}
        >
          {aula.agora && <NowPill />}
          <SubjectPill code={aula.code} color={aula.cor} />
        </ListItem>
      ))}
    </div>
  );
}

export function Hoje() {
  return (
    <>
      <Secao>Agenda de hoje: terça, 10 de novembro, 13:40</Secao>
      <Ficha nome="Hoje A" arquivo="peça nova" largura={4} uso={USO.a}>
        <Eixo versao="a" />
      </Ficha>
      <Ficha nome="Hoje B" arquivo="peça nova" largura={4} uso={USO.b}>
        <Eixo versao="b" />
      </Ficha>
      <Ficha nome="Hoje C" arquivo="ListItem" largura={4} uso={USO.c}>
        <Lista />
      </Ficha>
    </>
  );
}
