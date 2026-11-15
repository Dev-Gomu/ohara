// Bancada "Indicadores do Treino", refinos da V1: Novos, Aprendendo e Revisar dentro da barra.
// Caixa de 700 px, igual nos dois modos. Dados de mentira: o app ainda não guarda o estado do
// cartão (vem com o FSRS, Etapa 11). Cartão zerado fica apagado.
import { useState } from 'react';
import bloco from '../../../src/ui/components/Block.module.css';
import { Button } from '../../../src/ui/components/Button';
import pill from '../../../src/ui/components/Pill.module.css';
import esc from '../../../src/ui/screens/treino/Escolha.module.css';
import { Meio, Modo, Personalizado } from '../treino-altura/_tela';
import '../treino-altura/th.css';
import './ti.css';

const TIPOS = [
  { nome: 'Novos', cor: 3 },
  { nome: 'Aprendendo', cor: 5 },
  { nome: 'Revisar', cor: 0 },
] as const;
const TODOS = [10, 4, 31];
const FILTRADO = [2, 0, 3];

export type Estilo = 'a' | 'b' | 'c';

function Resumo({ soma, custom }: { soma: number; custom: boolean }) {
  return (
    <>
      <span className="ti-total">{soma}</span>
      <span className="ti-resumo">
        <b>cartões para hoje</b>
        <span>{custom ? '38' : '412'} cartões no recorte</span>
      </span>
    </>
  );
}

function Tile({ i, v, estilo }: { i: number; v: number[]; estilo: Estilo }) {
  const t = TIPOS[i];
  const n = v[i] ?? 0;
  const zero = n === 0 ? 'ti-zero' : '';
  if (estilo === 'a')
    return (
      <div className={`ti-tile ${zero}`}>
        <span className="ti-marca" data-materia={t?.cor} />
        <span className="ti-rot">{t?.nome}</span>
        <b className="ti-num">{n}</b>
      </div>
    );
  if (estilo === 'b')
    return (
      <div className={`ti-tile ${zero}`}>
        <span className={`${pill.pilula} ${pill.materia}`} data-materia={t?.cor}>{t?.nome}</span>
        <b className="ti-num">{n}</b>
      </div>
    );
  return (
    <div className={`ti-seg ${zero}`}>
      <b className="ti-num">{n}</b>
      <span className="ti-rot">{t?.nome}</span>
    </div>
  );
}

function Barra({ custom, estilo }: { custom: boolean; estilo: Estilo }) {
  const v = custom ? FILTRADO : TODOS;
  const soma = v.reduce((a, b) => a + b, 0);
  const trio = [0, 1, 2].map((i) => <Tile key={i} i={i} v={v} estilo={estilo} />);
  return (
    <div className={`${bloco.bloco} ti-bloco ti-${estilo} th-fixo`} data-foco="dentro">
      <div className="ti-topo">
        <Resumo soma={soma} custom={custom} />
        {custom && <Button variant="quiet">Limpar filtros</Button>}
        <Button variant="primary" shortcut="Enter" cursor={!custom}>Iniciar treino</Button>
      </div>
      {estilo === 'c' ? <div className="ti-ilha">{trio}</div> : <div className="ti-trio">{trio}</div>}
    </div>
  );
}

export function Tela({ estilo, titulo, nota }: { estilo: Estilo; titulo: string; nota: string }) {
  const [custom, setCustom] = useState(false);
  return (
    <div className="th">
      <p className="th-tit"><b>{titulo}</b> {nota} (clique nos modos para alternar)</p>
      <div className="th-tela">
        <div className="th-pilha">
          <div className={`${esc.par} th-fixo`}>
            <Modo nome="Todos os cartões" texto="Tudo o que está no acervo, de todos os anos." pe="412 cartões" sel={!custom} onClick={() => setCustom(false)} />
            <Modo nome="Personalizado" texto="Escolha anos, bimestres, disciplinas ou aulas." pe={custom ? '38 cartões' : 'Nenhum filtro marcado'} sel={custom} onClick={() => setCustom(true)} />
          </div>
          {custom ? <Personalizado /> : <Meio variante="resumo" />}
          <Barra custom={custom} estilo={estilo} />
        </div>
      </div>
    </div>
  );
}
