// V2 · Janela larga: régua de tipos à esquerda, lista no meio e prévia do que volta junto à direita.
import { useRef, useState } from 'react';
import { Field } from '../../../src/ui/components/Controls';
import { SubjectPill } from '../../../src/ui/components/Pill';
import { Entrada, Janela, Teclas, TIPOS, Vazia, quando, resta, umTipo, useLixeira, useTeclas, type Tipo } from './_partes';
import { Linha } from './_linha';
import { LIXEIRA } from '../../_dados';

const REGUA: readonly { id: Tipo | 'tudo'; nome: string }[] = [{ id: 'tudo', nome: 'Tudo' }, ...TIPOS];

export default function V2() {
  const [tipo, setTipo] = useState<Tipo | 'tudo'>('tudo');
  const l = useLixeira((i) => tipo === 'tudo' || i.tipo === tipo);
  const busca = useRef<HTMLInputElement>(null);
  const raiz = useTeclas(l, busca, (e) => {
    if (e.target === busca.current || l.confirma) return false;
    if (e.code !== 'ArrowLeft' && e.code !== 'ArrowRight') return false;
    const i = REGUA.findIndex((r) => r.id === tipo) + (e.code === 'ArrowRight' ? 1 : -1);
    setTipo(REGUA[(i + REGUA.length) % REGUA.length]!.id);
    l.setCursor(0);
    return true;
  });
  const conta = (id: Tipo | 'tudo') => l.itens.filter((i) => id === 'tudo' || i.tipo === id).length;
  const a = l.atual;
  return (
    <div className="lx-palco">
      <Entrada />
      <Janela larga l={l} raiz={raiz} pe={<Teclas itens={[['← →', 'tipo'], ['↑ ↓', 'anda'], ['Enter', 'restaura'], ['Alt O', 'apagar de vez'], ['Alt F', 'busca'], ['Esc', 'fecha']]} />}>
        <div className="lx-v2">
          <nav className="lx-regua" aria-label="Tipos">
            {REGUA.map((r) => (
              <button key={r.id} type="button" data-sel={tipo === r.id} disabled={conta(r.id) === 0 && r.id !== 'tudo'} onClick={() => { setTipo(r.id); l.setCursor(0); }}>
                {r.nome} <span>{conta(r.id)}</span>
              </button>
            ))}
          </nav>
          <div className="lx-v2-meio">
            <div className="lx-busca">
              <Field label="Buscar na lixeira" shortcut="Alt F" ref={busca} value={l.busca} onChange={(e) => { l.setBusca(e.target.value); l.setCursor(0); }} />
            </div>
            {l.vistos.length === 0 ? <Vazia busca={l.busca} /> : (
              <ul className="lx-lista">{l.vistos.map((i, n) => <Linha key={i.id} i={i} n={n} l={l} tipo={tipo === 'tudo'} />)}</ul>
            )}
          </div>
          <aside className="lx-previa">
            {a ? (
              <>
                <small>{umTipo(a.tipo)}{a.materia ? ' · ' : ''}{a.cor >= 0 ? <SubjectPill code={a.materia} color={a.cor} /> : null}</small>
                <h3>{a.titulo}</h3>
                <dl>
                  <dt>Na lixeira</dt><dd>desde {quando(a.quando)}</dd>
                  <dt>Some</dt><dd>{resta(a.quando) ?? `em ${30 - a.quando} d`}</dd>
                  <dt>Volta junto</dt><dd>{a.traz || 'nada mais'}</dd>
                </dl>
                {a.tipo === 'cartao' && a.id === 'x2' ? <p className="lx-apoio">A aula “{LIXEIRA[0].titulo}” também está na lixeira: restaurar o cartão restaura a aula.</p> : null}
              </>
            ) : <p className="lx-apoio">Nada escolhido.</p>}
          </aside>
        </div>
      </Janela>
    </div>
  );
}
