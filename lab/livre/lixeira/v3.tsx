// V3 · Janela comum agrupada pela data da exclusão (Hoje, Esta semana, Antes); o tipo vai no apoio.
import { useRef } from 'react';
import { Field } from '../../../src/ui/components/Controls';
import { Entrada, Janela, PRAZO, Teclas, Vazia, useLixeira, useTeclas } from './_partes';
import { Linha } from './_linha';

const FAIXAS = [
  { nome: 'Hoje', de: 0, ate: 0 },
  { nome: 'Esta semana', de: 1, ate: 6 },
  { nome: 'Antes', de: 7, ate: PRAZO },
];

export default function V3() {
  const l = useLixeira(undefined, (a, b) => a.quando - b.quando);
  const busca = useRef<HTMLInputElement>(null);
  const raiz = useTeclas(l, busca);
  return (
    <div className="lx-palco">
      <Entrada />
      <Janela l={l} raiz={raiz} pe={<Teclas itens={[['↑ ↓', 'anda'], ['Enter', 'restaura'], ['Alt O', 'apagar de vez'], ['Alt F', 'busca'], ['Esc', 'fecha']]} />}>
        <div className="lx-busca">
          <Field label="Buscar na lixeira" shortcut="Alt F" ref={busca} value={l.busca} onChange={(e) => { l.setBusca(e.target.value); l.setCursor(0); }} />
        </div>
        {l.vistos.length === 0 ? <Vazia busca={l.busca} /> : (
          <div className="lx-lista">
            {FAIXAS.map((f) => {
              const da = l.vistos.filter((i) => i.quando >= f.de && i.quando <= f.ate);
              if (da.length === 0) return null;
              return (
                <section key={f.nome}>
                  <h3 className="lx-grupo">{f.nome} <span>{da.length}</span></h3>
                  <ul>{da.map((i) => <Linha key={i.id} i={i} n={l.vistos.indexOf(i)} l={l} tipo />)}</ul>
                </section>
              );
            })}
          </div>
        )}
      </Janela>
    </div>
  );
}
