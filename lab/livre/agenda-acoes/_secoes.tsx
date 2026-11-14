// Seções 2 e 3, iguais nas duas versões (a dúvida real de fluxo está só no item 1).
import { Avaliacoes, Aviso, JanelaEvento, JanelaMover, PreviaAula, Secao, Teclas } from './_partes';
import type { Bancada } from './_estado';

export function SecaoApresentacao({ b }: { b: Bancada }) {
  return (
    <Secao
      n={2}
      titulo="Tipo Apresentação"
      nota="Novo tipo na Agenda (Alt N), com matéria, dia e horário. No Hub entra no bloco de avaliações, que deixa de ser só Provas."
    >
      <div
        className="aa-tela"
        tabIndex={0}
        onKeyDown={b.teclasAval}
        aria-label="Bloco de avaliações do Hub"
      >
        <Avaliacoes />
        <Teclas
          itens={[
            ['← →', 'tipo'],
            ['Enter', 'escolhe'],
          ]}
        />
      </div>
      <JanelaEvento
        tipo={b.tipo}
        materia={b.materia}
        cursor={b.cur.aval}
        contexto="Agenda · Alt N"
        onTipo={b.setTipo}
        onMateria={b.setMateria}
      />
    </Secao>
  );
}

export function SecaoPrevia({ b }: { b: Bancada }) {
  const sem = b.sem[b.aula.id] === true;
  return (
    <Secao
      n={3}
      titulo="Prévia da aula: Mover, Sem aula, aula avulsa"
      nota="Exceções aula a aula (G4). A Grade não muda. Aula avulsa entra no Novo evento (Alt N) da Agenda e no “Novo neste dia”."
    >
      <div className="aa-tela" tabIndex={0} onKeyDown={b.teclasAg} aria-label="Prévia da Agenda">
        <div className="aa-lista-dia" role="listbox" aria-label="Aulas de sexta, 13">
          {[0, 1, 2].map((n) => <ItemDia key={n} n={n} b={b} sel={n === b.aulaN} />)}
        </div>
        <PreviaAula
          aula={b.aula}
          cursor={b.cur.ag}
          sem={sem}
          onMover={() => b.setJAg('mover')}
          onSem={b.semAula}
          onDesfazer={b.desfazer}
        />
        {b.aviso && (
          <Aviso texto={b.aviso.texto} {...(b.aviso.desfazer && { onDesfazer: b.desfazer })} />
        )}
        <Teclas
          itens={[
            ['↑ ↓', 'aula'],
            ['← →', 'botão'],
            ['Enter', 'faz'],
            ['Alt N', 'aula avulsa'],
            ['Alt Z', 'desfaz'],
          ]}
        />
      </div>
      {b.jAg === 'mover' ? (
        <JanelaMover
          aula={b.aula}
          dia={b.diaMover}
          cursor={3}
          onDia={b.setDiaMover}
          onFechar={() => b.setJAg('avulsa')}
        />
      ) : (
        <JanelaEvento
          tipo={b.tipoAv}
          materia={b.materiaAv}
          cursor={4}
          contexto="Agenda · sexta, 13"
          onTipo={b.setTipoAv}
          onMateria={b.setMateriaAv}
          onFechar={() => b.setJAg('mover')}
        />
      )}
    </Secao>
  );
}

import { AGENDA_ACOES } from '../../_dados';
import { SubjectPill } from '../../../src/ui/components/Pill';

function ItemDia({ n, b, sel }: { n: number; b: Bancada; sel: boolean }) {
  const a = AGENDA_ACOES.aulasDoDia[n];
  if (!a) return null;
  const sem = b.sem[a.id] === true;
  return (
    <button
      type="button"
      className="aa-item"
      data-sel={sel || undefined}
      data-sem={sem || undefined}
      onClick={() => b.setAulaN(n)}
    >
      <SubjectPill code={a.sigla} color={a.cor} />
      <span className="aa-item-texto">
        <b>{a.titulo}</b>
        <span>
          {a.inicio} – {a.fim}
          {sem ? ' · sem aula' : ''}
        </span>
      </span>
    </button>
  );
}
