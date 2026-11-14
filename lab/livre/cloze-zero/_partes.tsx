// Bancada "cloze-zero" (14/11, rodada 5): a fonte escolhida para o cloze (letra de leitura, peso 600)
// aplicada em todos os cartões: cloze, cartão simples da Mesa (peça real StudyCard) e Treino (antes e depois de virar).
// Três formatações do texto (altura de linha, espaço entre letras, alinhamento). O tamanho da letra no Treino está em lab/livre/treino-letra/.
import type { ReactNode } from 'react';
import { CardBack, StudyCard } from '../../../src/ui/components/CardBack';
import './cloze.css';

export type Modo = 'arejado' | 'justo' | 'esquerda';

const CURTA = 'Qual citocina induz a síntese de PCR no fígado?';
const LONGA =
  'Paciente de 72 anos com angina, síncope aos esforços e dispneia progressiva, com sopro sistólico em crescendo-decrescendo que irradia para as carótidas: qual o diagnóstico mais provável e a conduta?';
const VERSO_CURTO = '# Resposta\n- IL-6\n- Produzida por macrófagos';
const VERSO = '# Diagnóstico\n- Estenose aórtica grave\n- Tríade: angina, síncope, dispneia\n# Conduta\n- Ecocardiograma\n- Troca valvar se sintomático';

const Sec = ({ t, children }: { t: string; children: ReactNode }) => (
  <section>
    <h2 className="zr-rot">{t}</h2>
    <div className="zr-par">{children}</div>
  </section>
);

function Cloze({ aberta }: { aberta: boolean }) {
  return (
    <article className={`zr-card ${aberta ? 'zr-claro' : 'zr-azul'}`}>
      <p className="zr-frase">
        A {aberta ? <b className="zr-resp">IL-6</b> : <b className="zr-oc">[…]</b>} é produzida por macrófagos e induz a síntese de
        PCR no fígado.
      </p>
    </article>
  );
}

// Treino antes de virar: o cartão inteiro é a frente (D150).
const Cheia = ({ q, tam }: { q: string; tam?: 'm' }) => (
  <div className="zr-palco zr-azul">
    <span className="zr-rotulo">Frente</span>
    <span className="zr-pergunta" data-tam={tam}>{q}</span>
    <span className="zr-dica">Toque ou Espaço para revelar</span>
  </div>
);

// Treino depois de virar: a frente encolhe no topo e o verso vem abaixo.
const Revelado = ({ q, back }: { q: string; back: string }) => (
  <div className="zr-palco">
    <div className="zr-topo zr-azul">{q}</div>
    <div className="zr-verso"><CardBack back={back} colorTitles /></div>
  </div>
);

export function Pagina({ modo, nota }: { modo: Modo; nota: string }) {
  return (
    <div className={`zr-pagina zr-nova zr-${modo}`}>
      <p className="zr-nota">{nota}</p>
      <Sec t="Cloze · frente e verso"><Cloze aberta={false} /><Cloze aberta /></Sec>
      <Sec t="Cartão simples na Mesa · pergunta curta e longa">
        <StudyCard front={CURTA} back={VERSO_CURTO} colorTitles />
        <StudyCard front={LONGA} back={VERSO} colorTitles />
      </Sec>
      <Sec t="Treino · antes de virar, pergunta curta e longa"><Cheia q={CURTA} /><Cheia q={LONGA} tam="m" /></Sec>
      <Sec t="Treino · depois de virar"><Revelado q={CURTA} back={VERSO_CURTO} /><Revelado q={LONGA} back={VERSO} /></Sec>
    </div>
  );
}
