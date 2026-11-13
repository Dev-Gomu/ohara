// Peças comuns das 3 versões do Treino com o cartão novo (D138). Query: &estado=frente|verso, &cor=on,
// &dens=compacta, &extremo=1 (frente longa + verso com muitas seções).
import { useState, type ReactNode } from 'react';
import '../mesa-flashcard/cartao.css';
import './treino.css';

export const pedido = new URLSearchParams(location.search);
document.documentElement.dataset.corTitulos = pedido.get('cor') === 'on' ? 'on' : 'off';

type Tipo = 'frente' | 'secao' | 'sub' | 'item' | 'numero' | 'seta' | 'texto';
interface Linha { tipo: Tipo; marca: string; texto: string }
const MARCAS: readonly [Tipo, RegExp][] = [
  ['frente', /^@\s?/], ['sub', /^##\s?/], ['secao', /^#\s?/], ['seta', /^->\s?/], ['item', /^-\s/], ['numero', /^\d+[.)]\s/],
];
const SIMBOLO: Partial<Record<Tipo, string>> = { item: '•', seta: '→' };
function ler(cru: string): Linha {
  for (const [tipo, marca] of MARCAS) {
    const a = marca.exec(cru);
    if (a) return { tipo, marca: a[0].trim(), texto: cru.slice(a[0].length) };
  }
  return { tipo: 'texto', marca: '', texto: cru };
}
const html = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/==([^=]+)==/g, '<mark>$1</mark>').replace(/->/g, '→');

const NORMAL = `@Testes de Weber e Rinne
#Conceito
Avaliam a acuidade auditiva e ajudam a diferenciar perda condutiva de sensorioneural.
#Weber
##Execução
Diapasão vibrando no topo da cabeça.
##Achados
**Normal**
-> Som percebido igualmente nos dois lados.
**Alteração**
-> Lateralização do som.
- Perda condutiva -> lateraliza para o lado afetado.
- Perda sensorioneural -> lateraliza para o lado saudável.
#Realizados em conjunto
Weber -> identifica para qual lado o som lateraliza
Rinne -> determina o tipo de perda auditiva`;

const EXTREMO = `@Quais são os critérios diagnósticos, o tratamento de primeira linha e as complicações tardias da síndrome nefrótica em adultos com glomerulopatia membranosa primária?
#Definição
Proteinúria maior que 3,5 g/24 h, hipoalbuminemia, edema e dislipidemia.
#Diagnóstico
##Laboratório
Proteinúria de 24 horas, albumina sérica, colesterol total e frações.
##Anti-PLA2R
Positivo em cerca de 70% dos casos; ==dispensa biópsia== quando positivo e função renal estável.
##Biópsia
Espessamento da membrana basal com "spikes" na prata.
#Tratamento
##Suporte
- IECA ou BRA para reduzir a proteinúria
- Diurético de alça para o edema
- Estatina para a dislipidemia
##Imunossupressão
1. Rituximabe como primeira linha em risco moderado a alto
2. Ciclofosfamida com corticoide em risco alto
3. Inibidor de calcineurina como alternativa
#Complicações
##Trombose
**Veia renal** -> risco maior com albumina abaixo de 2,5 g/dL
Anticoagular conforme o risco de sangramento.
##Infecções
Perda urinária de imunoglobulinas.
##Progressão
Cerca de um terço evolui para doença renal crônica.
#Prognóstico
Remissão espontânea em até 30% dos casos em 5 anos.`;

// Estresse (&extremo=2): caso clínico inteiro na frente, com o verso longo do extremo 1.
const ENORME = `@Homem de 58 anos, hipertenso e diabético há 15 anos, em uso irregular de losartana e metformina, procura o pronto-socorro com edema progressivo de membros inferiores há três semanas, urina espumosa e ganho de 6 kg no período. Ao exame: PA 168 x 102 mmHg, anasarca, sem turgência jugular. Exames: creatinina 1,4 mg/dL, albumina 2,1 g/dL, colesterol total 342 mg/dL, proteinúria de 7,8 g em 24 horas, sedimento urinário sem hemácias dismórficas, anti-PLA2R positivo em título alto. Qual é o diagnóstico mais provável, quais critérios o sustentam, qual o tratamento de primeira linha e quais complicações tardias devem ser vigiadas?`;
const extremo = pedido.get('extremo');
const TEXTO = extremo === '2' ? [ENORME, ...EXTREMO.split('\n').slice(1)].join('\n') : extremo === '1' ? EXTREMO : NORMAL;
export const CARTAO = TEXTO.split('\n').map(ler);

export function agrupar(linhas: Linha[]) {
  const g: { t?: number; l: number[]; s: { t: number; l: number[] }[] }[] = [];
  linhas.forEach((x, i) => {
    if (x.tipo === 'frente') return;
    if (x.tipo === 'secao' || g.length === 0) g.push({ l: [], s: [] });
    const a = g[g.length - 1]!;
    if (x.tipo === 'secao') a.t = i;
    else if (x.tipo === 'sub') a.s.push({ t: i, l: [] });
    else (a.s.at(-1)?.l ?? a.l).push(i);
  });
  return g;
}

export function Lin({ i }: { i: number }) {
  const { tipo, marca, texto } = CARTAO[i]!;
  const corpo = <span dangerouslySetInnerHTML={{ __html: html(texto) }} />;
  if (tipo === 'numero' || SIMBOLO[tipo])
    return <div className="fc-linha"><div className={`fc-h${tipo === 'numero' ? ' n' : ''}`}><span>{tipo === 'numero' ? marca : SIMBOLO[tipo]}</span>{corpo}</div></div>;
  return <div className="fc-linha">{corpo}</div>;
}

export function Frente({ solo }: { solo?: boolean }) {
  return <div className={`fc-frente${solo ? ' so' : ''}`}><Lin i={0} /></div>;
}

export function VersoTexto() {
  return (
    <>
      {agrupar(CARTAO).map((g, k) => (
        <section key={k}>
          {g.t !== undefined && <h3><Lin i={g.t} /></h3>}
          {g.l.map((i) => <Lin key={i} i={i} />)}
          {g.s.map((s) => (
            <div key={s.t} className="fc-sub">
              <div className="fc-st"><Lin i={s.t} /></div>
              {s.l.map((i) => <Lin key={i} i={i} />)}
            </div>
          ))}
        </section>
      ))}
    </>
  );
}

export type Estado = 'frente' | 'verso';
export function useEstado() {
  const [estado, setEstado] = useState<Estado>(pedido.get('estado') === 'frente' ? 'frente' : 'verso');
  return { estado, setEstado, virado: estado === 'verso' };
}

export const NOTAS: readonly [number, string, string][] = [
  [1, 'Errei', '< 1 min'], [2, 'Difícil', '6 min'], [3, 'Bom', '1 dia'], [4, 'Fácil', '4 dias'],
];
export function Notas({ dentro, mostrarPrazo, estilo = 1, onNota }: { dentro?: boolean; mostrarPrazo?: boolean; estilo?: 1 | 2 | 3; onNota?: () => void }) {
  return (
    <div className={`${dentro ? 'tc-dentro' : 'tc-notas'} tc-n${estilo}`}>
      {NOTAS.map(([g, rotulo, prazo]) => (
        <button key={g} type="button" className="tc-nota" data-g={g} onClick={onNota}>
          <span>{rotulo}{mostrarPrazo && <small>{prazo}</small>}</span> <kbd>{g}</kbd>
        </button>
      ))}
    </div>
  );
}
export function VerResposta({ onClick }: { onClick: () => void }) {
  return <button type="button" className="tc-ver" onClick={onClick}>Ver resposta <kbd>Espaço</kbd></button>;
}

// Casca da tela de Treino (título, contador) + alternador de estado só da bancada.
export function Tela({ estado, setEstado, children }: { estado: Estado; setEstado: (e: Estado) => void; children: ReactNode }) {
  const compacta = pedido.get('dens') === 'compacta';
  return (
    <div className={`fc-escopo tc-escala ${compacta ? 'fc-compacta' : 'fc-padrao'}${pedido.get('cheia') === '1' ? ' tc-cheia' : ''}`}>
      <div className="tc-estados">
        {(['frente', 'verso'] as Estado[]).map((e) => (
          <button key={e} aria-pressed={estado === e} onClick={() => setEstado(e)}>{e === 'frente' ? 'Antes de virar' : 'Virado'}</button>
        ))}
      </div>
      <div className="tc-tela">
        <div className="tc-topo">
          <span>Treino</span>
          {pedido.get('cheia') === '1' && document.fullscreenEnabled && (
            <button type="button" className="tc-fs" onClick={() => void (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())}>Tela cheia</button>
          )}
          <span className="tc-pilula">4 de 12</span>
        </div>
        <div className="tc-palco">{children}</div>
      </div>
    </div>
  );
}
