// Grupo Cartões com o cartão de verdade (StudyCard do app), três jeitos de mostrar o efeito.
import { StudyCard } from '../../../src/ui/components/CardBack';
import type { Chave, Escolhas } from './_partes';

export type Variante = 'reduzido' | 'unico' | 'recorte';

const FRENTE = 'Qual citocina induz a síntese de PCR no fígado?';
const VERSO = '# Resposta\n- IL-6, produzida por macrófagos ativados\n- Age nos hepatócitos\n## Outras proteínas de fase aguda\n- Fibrinogênio\n- Ferritina\n# Clínica\n- PCR sobe em 6 a 8 horas\n- Pico em 48 horas';

type P = { e: Escolhas; sel: Chave; setSel: (k: Chave) => void; mudar: (k: Chave, v: string) => void };

const AJ: { k: 'tamanho' | 'corTitulos'; rotulo: string; detalhe: string; opcoes: [string, string][] }[] = [
  { k: 'tamanho', rotulo: 'Tamanho do cartão', detalhe: 'Compacto cabe mais texto no verso.', opcoes: [['padrao', 'Padrão'], ['compacto', 'Compacto']] },
  { k: 'corTitulos', rotulo: 'Cor nos títulos', detalhe: 'Títulos do verso na cor de ação.', opcoes: [['sim', 'Com cor'], ['nao', 'Sem cor']] },
];

const Carta = ({ e }: { e: Escolhas }) => (
  <StudyCard front={FRENTE} back={VERSO} compact={e.tamanho === 'compacto'} colorTitles={e.corTitulos === 'sim'} />
);

// Versão resumida: pergunta curta e verso de duas seções, no cartão real reduzido.
const RESUMO = '# Resposta\n- IL-6\n- Macrófagos ativados\n# Clínica\n- Sobe em 6 a 8 horas';
const Resumida = ({ e }: { e: Escolhas }) => (
  <StudyCard front="Citocina que induz a PCR?" back={RESUMO} compact={e.tamanho === 'compacto'} colorTitles={e.corTitulos === 'sim'} />
);

// V1 e V3: cada opção mostra o cartão real com aquela escolha (inteiro reduzido, ou recorte em tamanho real).
function PorOpcao({ variante, e, sel, setSel, mudar }: P & { variante: 'reduzido' | 'recorte' }) {
  return (
    <>
      {AJ.map((a) => (
        <div key={a.k} className="cf-bloco" data-sel={sel === a.k} onClick={() => setSel(a.k)}>
          <span className="cg-texto"><b>{a.rotulo}</b><span className="cg-det">{a.detalhe}</span></span>
          <span className="cf-amostras">
            {a.opcoes.map(([v, nome]) => (
              <button key={v} className="cf-amostra" data-on={e[a.k] === v} onClick={() => mudar(a.k, v)}>
                <span className={variante === 'reduzido' ? 'cc-reduzido' : 'cc-recorte'}>
                  <span className="cc-escala"><Carta e={{ ...e, [a.k]: v } as Escolhas} /></span>
                </span>
                <span className="cf-nome"><i className="cf-marca" />{nome}</span>
              </button>
            ))}
          </span>
        </div>
      ))}
    </>
  );
}

// V2: escolhas curtas à direita (como Tema) e um cartão real só, embaixo, que muda com elas.
function Unico({ e, sel, setSel, mudar }: P) {
  return (
    <div className="cc-lado">
      <div className="cc-linhas">
      {AJ.map((a) => (
        <div key={a.k} className="cf-linha" data-sel={sel === a.k} onClick={() => setSel(a.k)}>
          <span className="cg-texto"><b>{a.rotulo}</b><span className="cg-det">{a.detalhe}</span></span>
          <span className="cf-par">
            {a.opcoes.map(([v, nome]) => (
              <button key={v} className="cf-par-op" data-on={e[a.k] === v} onClick={() => mudar(a.k, v)}>{nome}</button>
            ))}
          </span>
        </div>
      ))}
      </div>
      <span className="cc-resumo"><span className="cc-escala"><Resumida e={e} /></span></span>
    </div>
  );
}

export function GrupoCartoes(props: P & { variante: Variante }) {
  return props.variante === 'unico' ? <Unico {...props} /> : <PorOpcao {...props} variante={props.variante} />;
}
