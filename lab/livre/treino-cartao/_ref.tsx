// Rodada 4: cartão de treino a partir da referência do usuário (frente cheia e centrada; verso em duas colunas).
// Adaptado às regras do app: sem tarja lateral, sem linha divisória, sem fundo quente.
import { CARTAO, Lin, Notas, Tela, agrupar, useEstado } from './_partes';

export function Ref({ frente, pecas, titulo = 2, topo }: { frente: 'forte' | 'suave'; pecas: boolean; titulo?: 1 | 2 | 3; topo?: 'cartao' | 'texto' | 'suave' }) {
  const { estado, setEstado, virado } = useEstado();
  // Pergunta longa encolhe a letra em dois degraus; passando disso, rola dentro da própria área.
  const n = CARTAO[0]!.texto.length;
  const tam = n > 360 ? 'g' : n > 140 ? 'm' : 'p';
  return (
    <Tela estado={estado} setEstado={setEstado}>
      <div className={`tc-cartao tc-ref tc-ref-${frente}${pecas ? ' tc-ref-pecas' : ''} tc-t${titulo}`} style={{ flex: 1 }}>
        {virado && topo && (
          <div className={`tc-q tc-q-${topo}`} data-tam={tam}>
            {topo !== 'texto' && <div className="tc-rot">Frente</div>}
            {CARTAO[0]!.texto}
          </div>
        )}
        {virado ? (
          <article className="fc-card tc-rv">
            {topo !== 'texto' && <div className="tc-rot">Verso</div>}
            <div className="fc-verso">
              {!topo && <div className="tc-rtit">{CARTAO[0]!.texto}</div>}
              <div className="tc-cols">
                {agrupar(CARTAO).map((g, k) => (
                  <section key={k}>
                    {g.t !== undefined && <h3><Lin i={g.t} /></h3>}
                    {g.l.length > 0 && <div className="tc-peca">{g.l.map((i) => <Lin key={i} i={i} />)}</div>}
                    {g.s.map((s) => (
                      <div key={s.t} className="tc-peca">
                        <div className="fc-st"><Lin i={s.t} /></div>
                        {s.l.map((i) => <Lin key={i} i={i} />)}
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            </div>
          </article>
        ) : (
          <button type="button" className="fc-card tc-rf" onClick={() => setEstado('verso')}>
            <span className="tc-rot">Frente</span>
            <span className="tc-rq" data-tam={tam}>{CARTAO[0]!.texto}</span>
            <span className="tc-rdica">Toque ou Espaço para revelar</span>
          </button>
        )}
      </div>
      {virado && <Notas estilo={2} onNota={() => setEstado('frente')} />}
    </Tela>
  );
}
