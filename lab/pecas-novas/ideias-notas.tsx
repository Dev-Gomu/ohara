// Notas (D113 e D114) na linguagem nova: régua de matérias com marca alongada, resumo em faixa,
// boletim em faixas por semestre. Sem círculos, sem aba sublinhada, só a sigla da matéria.
import { Button } from '../../src/ui/components/Button';
import { FilterChip, FilterGrid } from '../../src/ui/components/Filter';
import { StatePill, SubjectPill } from '../../src/ui/components/Pill';
import { Ficha, Secao } from '../vitrine/moldura';

type Nota = number | null;
interface Linha {
  code: string;
  cor: number;
  b: [Nota, Nota, Nota];
  falta: string | null;
  sit: 'ok' | 'atencao' | null;
}

const LINHAS: Linha[] = [
  { code: 'GEN', cor: 0, b: [2.5, 5.4, 2.3], falta: '3,8', sit: 'ok' },
  { code: 'IMU', cor: 2, b: [2.0, 4.6, 1.9], falta: '5,5', sit: 'atencao' },
  { code: 'PRO', cor: 1, b: [2.4, 4.9, 1.8], falta: '4,9', sit: 'atencao' },
  { code: 'APS', cor: 3, b: [2.3, 5.7, 1.9], falta: '4,1', sit: 'ok' },
  { code: 'PSI', cor: 5, b: [null, null, null], falta: null, sit: null },
];

const f = (n: Nota) => (n === null ? '—' : n.toFixed(1).replace('.', ','));

// Nota abaixo de 70% do que valia o bimestre ganha o tom de atenção.
function Bim({ v, max }: { v: Nota; max: number }) {
  if (v === null) return <span className="nt-vazio">—</span>;
  return v / max < 0.7 ? <span className="nt-baixa">{f(v)}</span> : <span>{f(v)}</span>;
}

export function Notas() {
  return (
    <>
      <Secao>Notas</Secao>
      <Ficha
        nome="Boletim geral"
        arquivo="FilterChip, StatePill"
        largura={12}
        uso="Régua com a marca da matéria e a média, resumo em uma faixa, boletim em pontos com cada semestre abraçando seus dois bimestres e o ano à parte. Situação atual: Na meta, Atenção, Sem notas."
      >
        <FilterGrid label="Matérias">
          <FilterChip selected>Boletim geral</FilterChip>
          {LINHAS.map((l) => (
            <FilterChip key={l.code} subject={l.cor}>
              {`${l.code}  ${l.b[0] === null ? '—' : f((l.b[0] + (l.b[1] ?? 0)) )}`}
            </FilterChip>
          ))}
        </FilterGrid>
        <div className="nt-resumo">
          <div className="nt-bloco">
            <span className="v-uso">Média geral</span>
            <span className="nt-geral">7,2</span>
          </div>
          <div className="nt-bloco">
            <span>
              <b>3</b> de 5 na meta
            </span>
            <span>
              <b>2</b> pedem atenção
            </span>
          </div>
          <div className="nt-meta">
            <span className="v-uso">Meta do ano</span>
            <Button variant="quiet" label="Diminuir meta">
              ‹
            </Button>
            <b>7,0</b>
            <Button variant="quiet" label="Aumentar meta">
              ›
            </Button>
          </div>
        </div>
        <div className="nt-tabela">
          <div className="nt-linha nt-cab">
            <span>Matéria</span>
            <span>1º semestre · 1º e 2º bim · total</span>
            <span>2º semestre · 3º e 4º bim · total</span>
            <span>Ano</span>
            <span>Falta no 4º bim</span>
            <span>Situação</span>
          </div>
          {LINHAS.map((l, i) => {
            const s1 = l.b[0] === null ? null : l.b[0] + (l.b[1] ?? 0);
            return (
              <div key={l.code} className="nt-linha" data-sel={i === 2}>
                <span className="nt-sigla">
                  <SubjectPill code={l.code} color={l.cor} />
                </span>
                <div className="nt-faixa">
                  <Bim v={l.b[0]} max={3} />
                  <Bim v={l.b[1]} max={7} />
                  <span className="nt-total">{f(s1)}</span>
                </div>
                <div className="nt-faixa">
                  <Bim v={l.b[2]} max={3} />
                  <span className="nt-vazio">—</span>
                  <span className="nt-total nt-vazio">—</span>
                </div>
                <div className="nt-faixa" data-ano="true">
                  <span className="nt-vazio">—</span>
                </div>
                <span className="nt-falta">
                  {l.falta === null ? '—' : (
                    <>
                      <b>{l.falta}</b> de 7,0
                    </>
                  )}
                </span>
                <span className="nt-sit">
                  {l.sit === null ? 'Sem notas' : (
                    <StatePill state={l.sit}>{l.sit === 'ok' ? 'Na meta' : 'Atenção'}</StatePill>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </Ficha>
    </>
  );
}
