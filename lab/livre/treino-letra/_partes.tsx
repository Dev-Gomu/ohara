// Bancada "cloze-zero" (14/11, rodada 6): tamanho da letra no Treino, pensado para revisar no tablet deitado.
// Fonte e formatação já escolhidas (letra de leitura 600, centrada, linhas juntas e equilibradas). Aqui só o tamanho muda.
// Os palcos têm a largura real do Treino (920 px) e a altura de um tablet deitado.
import { CardBack } from '../../../src/ui/components/CardBack';
import './cloze.css';

export type Modo = 'hoje' | 'conforto' | 'grande';

const CURTA = 'Qual citocina induz a síntese de PCR no fígado?';
const LONGA =
  'Paciente de 72 anos com angina, síncope aos esforços e dispneia progressiva, com sopro sistólico em crescendo-decrescendo que irradia para as carótidas: qual o diagnóstico mais provável e a conduta?';
const VERSO =
  '# Diagnóstico\n- Estenose aórtica grave\n- Tríade: angina, síncope, dispneia\n- Sopro em crescendo-decrescendo, irradia para carótidas\n# Exames\n- Ecocardiograma: área valvar < 1 cm²\n- ECG: sobrecarga de ventrículo esquerdo\n# Conduta\n- Troca valvar se sintomático\n- TAVI se alto risco cirúrgico\n- Evitar vasodilatadores';
const NOTAS = ['De novo', 'Difícil', 'Bom', 'Fácil'];

const Cheia = ({ q, tam }: { q: string; tam?: 'm' }) => (
  <div className="tl-palco">
    <div className="tl-cheia">
      <span className="tl-rotulo">Frente</span>
      <span className="tl-pergunta" data-tam={tam}>{q}</span>
      <span className="tl-dica">Toque ou Espaço para revelar</span>
    </div>
  </div>
);

const Revelado = ({ q, tam }: { q: string; tam?: 'm' }) => (
  <div className="tl-palco">
    <div className="tl-topo" data-tam={tam}>{q}</div>
    <div className="tl-verso"><CardBack back={VERSO} colorTitles /></div>
    <div className="tl-notas">
      {NOTAS.map((n, i) => <span key={n} className="tl-notinha" data-bom={i === 2}>{n}</span>)}
    </div>
  </div>
);

export function Pagina({ modo, nota }: { modo: Modo; nota: string }) {
  return (
    <div className={`tl-pagina tl-${modo}`}>
      <p className="tl-nota">{nota}</p>
      <h2 className="tl-rot">Antes de virar · pergunta curta</h2>
      <Cheia q={CURTA} />
      <h2 className="tl-rot">Antes de virar · pergunta longa</h2>
      <Cheia q={LONGA} tam="m" />
      <h2 className="tl-rot">Depois de virar · pergunta longa</h2>
      <Revelado q={LONGA} tam="m" />
    </div>
  );
}
