// Bancada "cartoes-final" (14/11, rodada 3: alinhamento da faixa azul do cartão único; V1 esquerda, V2 centro, V3 misto)
// Rodada 2: D159 revista. Texto centrado (V2 justo) no cloze e na frente cheia do Treino;
// depois de virar, o Treino usa o cartão único da Mesa (StudyCard: faixa azul com a pergunta e verso no mesmo contorno),
// na Mesa e no Treino, cartão simples e cloze; Treino na escala grande do tablet (pergunta 48, longa 33, verso 22).
import type { ReactNode } from 'react';
import { CardBack, StudyCard } from '../../../src/ui/components/CardBack';
import './final.css';

const CURTA = 'Qual citocina induz a síntese de PCR no fígado?';
const LONGA =
  'Paciente de 72 anos com angina, síncope aos esforços e dispneia progressiva, com sopro sistólico em crescendo-decrescendo que irradia para as carótidas: qual o diagnóstico mais provável e a conduta?';
const VERSO_CURTO = '# Resposta\n- IL-6\n- Produzida por macrófagos';
const VERSO =
  '# Diagnóstico\n- Estenose aórtica grave\n- Tríade: angina, síncope, dispneia\n- Sopro em crescendo-decrescendo, irradia para carótidas\n# Exames\n- Ecocardiograma: área valvar < 1 cm²\n- ECG: sobrecarga de ventrículo esquerdo\n# Conduta\n- Troca valvar se sintomático\n- TAVI se alto risco cirúrgico\n- Evitar vasodilatadores';
const NOTAS = ['De novo', 'Difícil', 'Bom', 'Fácil'];

const Frase = ({ aberta }: { aberta: boolean }) => (
  <>
    A {aberta ? <b className="cf-resp">IL-6</b> : <b className="cf-oc">[…]</b>} é produzida por macrófagos e induz a síntese de PCR
    no fígado.
  </>
);

const Sec = ({ t, children, uma }: { t: string; children: ReactNode; uma?: boolean }) => (
  <section>
    <h2 className="cf-rot">{t}</h2>
    <div className={uma ? 'cf-uma' : 'cf-par'}>{children}</div>
  </section>
);

const Notas = () => (
  <div className="cf-notas">
    {NOTAS.map((n, i) => <span key={n} className="cf-nota" data-bom={i === 2}>{n}</span>)}
  </div>
);

// Treino antes de virar: o cartão inteiro é a frente.
const Cheia = ({ children, tam }: { children: ReactNode; tam?: 'm' }) => (
  <div className="cf-palco">
    <div className="cf-cheia">
      <span className="cf-rotulo">Frente</span>
      <p className="cf-pergunta" data-tam={tam}>{children}</p>
      <span className="cf-dica">Toque ou Espaço para revelar</span>
    </div>
  </div>
);

export type Modo = 'esquerda' | 'centro' | 'misto';

// Pergunta curta (até 80 letras) marca o cartão; o modo misto centraliza só essas.
const curta = (q: string) => q.length <= 80;

export function Pagina({ modo, nota }: { modo: Modo; nota: string }) {
  return (
    <div className={`cf-pagina cf-${modo}`}>
      <p className="cf-nota-topo">{nota}</p>

      <Sec t="Mesa · cloze, frente e verso">
        <article className="cf-card cf-azul"><p className="cf-frase"><Frase aberta={false} /></p></article>
        <article className="cf-card cf-claro"><p className="cf-frase"><Frase aberta /></p></article>
      </Sec>
      <Sec t="Mesa · cartão simples, pergunta curta e longa">
        <div data-curta={curta(CURTA)}><StudyCard front={CURTA} back={VERSO_CURTO} colorTitles /></div>
        <div data-curta={curta(LONGA)}><StudyCard front={LONGA} back={VERSO} colorTitles /></div>
      </Sec>

      <Sec t="Treino no tablet · cartão simples, antes de virar" uma><Cheia>{CURTA}</Cheia></Sec>
      <Sec t="Treino no tablet · pergunta longa, antes de virar" uma><Cheia tam="m">{LONGA}</Cheia></Sec>
      <Sec t="Treino no tablet · pergunta curta, depois de virar" uma>
        <div className="cf-palco cf-treino" data-curta={curta(CURTA)}>
          <StudyCard front={CURTA} back={VERSO} colorTitles />
          <Notas />
        </div>
      </Sec>
      <Sec t="Treino no tablet · pergunta longa, depois de virar" uma>
        <div className="cf-palco cf-treino" data-curta={curta(LONGA)}>
          <StudyCard front={LONGA} back={VERSO} colorTitles />
          <Notas />
        </div>
      </Sec>
      <Sec t="Treino no tablet · cloze, antes de virar" uma><Cheia><Frase aberta={false} /></Cheia></Sec>
      <Sec t="Treino no tablet · cloze, depois de virar" uma>
        <div className="cf-palco">
          <div className="cf-cheia cf-claro">
            <span className="cf-rotulo">Verso</span>
            <p className="cf-pergunta"><Frase aberta /></p>
            <span />
          </div>
          <Notas />
        </div>
      </Sec>
    </div>
  );
}
