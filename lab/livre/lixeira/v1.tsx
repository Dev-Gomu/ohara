// V1 · Janela de consulta comum (640 px): busca no topo e lista agrupada por tipo. Recomendada.
import { useRef } from 'react';
import { Field } from '../../../src/ui/components/Controls';
import { porTipo, Entrada, Janela, Teclas, TIPOS, Vazia, useLixeira, useTeclas } from './_partes';
import { Linha } from './_linha';

export default function V1() {
  const l = useLixeira(undefined, porTipo);
  const busca = useRef<HTMLInputElement>(null);
  const raiz = useTeclas(l, busca);
  let n = -1;
  return (
    <div className="lx-palco">
      <Entrada />
      <Janela l={l} raiz={raiz} pe={<Teclas itens={[['↑ ↓', 'anda'], ['Enter', 'restaura'], ['Alt O', 'apagar de vez'], ['Alt F', 'busca'], ['Esc', 'fecha']]} />}>
        <div className="lx-busca">
          <Field label="Buscar na lixeira" shortcut="Alt F" ref={busca} value={l.busca} onChange={(e) => { l.setBusca(e.target.value); l.setCursor(0); }} />
        </div>
        {l.vistos.length === 0 ? <Vazia busca={l.busca} /> : (
          <div className="lx-lista">
            {TIPOS.map((t) => {
              const doTipo = l.vistos.filter((i) => i.tipo === t.id);
              if (doTipo.length === 0) return null;
              return (
                <section key={t.id}>
                  <h3 className="lx-grupo">{t.nome} <span>{doTipo.length}</span></h3>
                  <ul>{doTipo.map((i) => { n = l.vistos.indexOf(i); return <Linha key={i.id} i={i} n={n} l={l} />; })}</ul>
                </section>
              );
            })}
          </div>
        )}
      </Janela>
    </div>
  );
}
