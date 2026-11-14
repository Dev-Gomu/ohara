// V2 · Ações no cabeçalho do calendário (ícone + palavra, ao lado do ⋮): não gasta altura do bloco.
// Itens 2 e 3 iguais à V1.
import './aa.css';
import { Button } from '../../../src/ui/components/Button';
import { Calendario, JanelaEvento, JanelaFalta, Secao, Teclas } from './_partes';
import { SecaoApresentacao, SecaoPrevia } from './_secoes';
import { useBancada } from './_estado';

export default function V2() {
  const b = useBancada();
  const tools = (
    <span className="aa-tools">
      <Button
        variant="quiet"
        cursor={b.cur.cal === 0}
        label="Registrar falta"
        onPress={() => b.setJCal('falta')}
      >
        Falta
      </Button>
      <Button
        variant="quiet"
        cursor={b.cur.cal === 1}
        label="Novo evento"
        onPress={() => b.setJCal('evento')}
      >
        + Evento
      </Button>
    </span>
  );
  return (
    <div className="aa-palco">
      <Secao
        n={1}
        titulo="Registrar falta e Novo evento no calendário do Hub"
        nota="V2: “Falta” e “+ Evento” no cabeçalho do bloco, ao lado do ⋮. A lista do dia fica com toda a altura."
      >
        <div
          className="aa-tela"
          tabIndex={0}
          onKeyDown={b.teclasCal}
          aria-label="Calendário do Hub"
        >
          <Calendario escolhido={b.dia} onEscolher={b.setDia} tools={tools} />
          <Teclas
            itens={[
              ['Alt N', 'novo evento'],
              ['Alt O', '⋮ → Registrar falta'],
              ['Alt T', 'cabeçalho'],
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
