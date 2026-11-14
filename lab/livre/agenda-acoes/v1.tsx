// V1 · Botões no pé do calendário do Hub (duas metades iguais, agem no dia escolhido). Recomendada.
import './aa.css';
import { Calendario, JanelaEvento, JanelaFalta, RodapeCal, Secao, Teclas } from './_partes';
import { SecaoApresentacao, SecaoPrevia } from './_secoes';
import { useBancada } from './_estado';

export default function V1() {
  const b = useBancada();
  return (
    <div className="aa-palco">
      <Secao
        n={1}
        titulo="Registrar falta e Novo evento no calendário do Hub"
        nota="V1: dois botões no pé do bloco, sempre à vista. Agem no dia escolhido no calendário."
      >
        <div
          className="aa-tela"
          tabIndex={0}
          onKeyDown={b.teclasCal}
          aria-label="Calendário do Hub"
        >
          <Calendario
            escolhido={b.dia}
            onEscolher={b.setDia}
            rodape={
              <RodapeCal
                cursor={b.cur.cal as 0 | 1}
                onFalta={() => b.setJCal('falta')}
                onEvento={() => b.setJCal('evento')}
              />
            }
          />
          <Teclas
            itens={[
              ['Alt N', 'novo evento'],
              ['Alt O', '⋮ → Registrar falta'],
              ['← →', 'botão'],
              ['Enter', 'abre'],
            ]}
          />
        </div>
        {b.jCal === 'falta' ? (
          <JanelaFalta
            marcas={b.marcas}
            cursor={4}
            onMarcar={(id, m) => b.setMarcas((x) => ({ ...x, [id]: m }))}
            onFechar={() => b.setJCal('evento')}
          />
        ) : (
          <JanelaEvento
            tipo={b.tipo}
            materia={b.materia}
            cursor={0}
            contexto="Calendário · sexta, 13"
            onTipo={b.setTipo}
            onMateria={b.setMateria}
            onFechar={() => b.setJCal('falta')}
          />
        )}
      </Secao>
      <SecaoApresentacao b={b} />
      <SecaoPrevia b={b} />
    </div>
  );
}
