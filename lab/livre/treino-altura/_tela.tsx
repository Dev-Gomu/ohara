// Bancada "Altura da escolha do Treino": o mesmo estado Todos nos dois modos, em caixa de altura
// fixa. Clique em Todos / Personalizado para ver as duas com a mesma altura.
import { useState } from 'react';
import bloco from '../../../src/ui/components/Block.module.css';
import { Button } from '../../../src/ui/components/Button';
import { Key } from '../../../src/ui/components/Key';
import { SubjectPill } from '../../../src/ui/components/Pill';
import esc from '../../../src/ui/screens/treino/Escolha.module.css';
import treino from '../../../src/ui/screens/treino/Treino.module.css';
import { ACERVO_MATERIAS } from '../../_dados';
import './th.css';

const MATERIAS = ACERVO_MATERIAS.slice(0, 10);
const HOJE: Record<string, number> = { IMU: 8, GEN: 1, PRO: 1, FIS: 3 };
const ANOS = ['1º', '2º', '3º', '4º'];
const POR_ANO = [
  { ano: '1º ano', total: 120, hoje: 0 },
  { ano: '2º ano', total: 210, hoje: 11 },
  { ano: '3º ano', total: 82, hoje: 3 },
];
const AULAS = [
  { nome: 'Resposta imune inata', info: '3 hoje', ok: true },
  { nome: 'Complemento e vias de ativação clássica e alternativa', info: '2 hoje', ok: true },
  { nome: 'Imunidade adaptativa', info: 'em dia', ok: false },
  { nome: 'Citocinas e quimiocinas', info: 'em dia', ok: false },
  { nome: 'Hipersensibilidade', info: 'em dia', ok: false },
];

export type Variante = 'altos' | 'resumo' | 'apagado';

export function Modo({ nome, texto, pe, sel, onClick }: { nome: string; texto: string; pe: string; sel: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`${bloco.bloco} ${esc.modo}`} data-marcado={sel} aria-pressed={sel} onClick={onClick}>
      <b className={esc.modoNome}>{nome}</b>
      <span className={esc.apoio}>{texto}</span>
      <span className={esc.pe}>{pe}</span>
    </button>
  );
}

function Regua({ rotulo, itens, marcados }: { rotulo: string; itens: string[]; marcados: number[] }) {
  return (
    <div className={`${bloco.bloco} ${esc.faixa}`}>
      <span className={`${esc.rotulo} ${esc.faixaRotulo}`}>{rotulo}</span>
      <div className={esc.regua}>
        {itens.map((t, i) => (
          <button type="button" key={t} className={esc.item} data-marcado={marcados.includes(i)}>{t}</button>
        ))}
      </div>
    </div>
  );
}

function Disciplinas({ fixa }: { fixa?: boolean }) {
  return (
    <div className={`${bloco.bloco} ${esc.disc}`}>
      <div className={esc.buscaForm}>
        <span className={esc.rotulo}>Disciplina</span>
        <input className={esc.campo} placeholder="Digite a sigla ou o nome" readOnly />
        <Key>Alt F</Key>
      </div>
      <div className={esc.grade}>
        {MATERIAS.map((m) => (
          <button type="button" key={m.sigla} className={`${esc.peca} ${fixa ? '' : ''}`} data-marcado={m.sigla === 'IMU'}>
            <SubjectPill code={m.sigla} color={m.cor} />
            <b className={esc.contagem}>{HOJE[m.sigla] ?? ''}</b>
            <small className={esc.situacao}>{HOJE[m.sigla] ? 'hoje' : 'em dia'}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function Aulas() {
  return (
    <div className={`${bloco.bloco} ${esc.aulas}`}>
      <header className={bloco.titulo}>
        <h2 className={bloco.nome}>Aulas</h2>
        <div className={bloco.fim}><span className={treino.contagem}>2 de 5</span></div>
      </header>
      <div className={treino.lista}>
        {AULAS.map((l) => (
          <div key={l.nome} className={`${treino.linha} ${esc.aulaLinha}`}>
            <span className={treino.marca} data-tipo="lesson" aria-checked={l.ok}>{l.ok ? '✓' : ''}</span>
            <span className={esc.aula}>{l.nome}</span>
            <span className={treino.contagem}>{l.info}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Barra({ custom }: { custom: boolean }) {
  return (
    <div className={`${bloco.bloco} ${esc.barra} th-fixo`} data-foco="dentro">
      <span className={esc.numero}>{custom ? 5 : 14}</span>
      <span className={esc.resumo}>
        <b className={esc.recorte}>cartões para hoje</b>
        <span className={esc.apoio}>{custom ? '38 cartões no recorte' : '412 cartões no recorte'}</span>
      </span>
      {custom && <Button variant="quiet">Limpar filtros</Button>}
      <Button variant="primary" shortcut="Enter" cursor={!custom}>Iniciar treino</Button>
    </div>
  );
}

export function Personalizado() {
  return (
    <>
      <div className={`${esc.par} th-fixo`}>
        <Regua rotulo="Ano" itens={ANOS} marcados={[1]} />
        <Regua rotulo="Bimestre" itens={['1º', '2º', '3º', '4º']} marcados={[0]} />
      </div>
      <div className="th-meio">
        <Disciplinas />
        <Aulas />
      </div>
    </>
  );
}

export function Meio({ variante }: { variante: Variante }) {
  if (variante === 'altos') return null;
  if (variante === 'apagado')
    return (
      <>
        <div className="th-apagado th-fixo" aria-hidden>
          <div className={esc.par}>
            <Regua rotulo="Ano" itens={ANOS} marcados={[]} />
            <Regua rotulo="Bimestre" itens={['1º', '2º', '3º', '4º']} marcados={[]} />
          </div>
        </div>
        <div className="th-meio th-apagado" aria-hidden>
          <Disciplinas />
          <div className={`${bloco.bloco} ${esc.aulas}`}>
            <header className={bloco.titulo}><h2 className={bloco.nome}>Aulas</h2></header>
            <p className={esc.vazio}>Escolha “Personalizado” para filtrar.</p>
          </div>
        </div>
      </>
    );
  return (
    <div className="th-meio">
      <div className={`${bloco.bloco} th-painel`}>
        <span className={esc.rotulo}>Disciplinas · para hoje</span>
        <div className="th-grade">
          {MATERIAS.map((m) => (
            <div key={m.sigla} className={`${esc.peca} th-peca-fixa`}>
              <SubjectPill code={m.sigla} color={m.cor} />
              <b className={esc.contagem}>{HOJE[m.sigla] ?? ''}</b>
              <small className={esc.situacao}>{HOJE[m.sigla] ? 'hoje' : 'em dia'}</small>
            </div>
          ))}
        </div>
      </div>
      <div className={`${bloco.bloco} th-painel`}>
        <span className={esc.rotulo}>No acervo · por ano</span>
        <div className="th-lista">
          {POR_ANO.map((a) => (
            <div key={a.ano} className="th-linha">
              <b>{a.ano}</b>
              <span>{a.hoje > 0 ? `${a.hoje} hoje · ` : ''}{a.total} cartões</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Tela({ variante, titulo, nota, altura = 700 }: { variante: Variante; titulo: string; nota: string; altura?: number }) {
  const [custom, setCustom] = useState(false);
  return (
    <div className="th">
      <p className="th-tit"><b>{titulo}</b> {nota} (altura da caixa: {altura}px; clique nos modos para alternar)</p>
      <div className="th-tela">
        <div className="th-pilha" style={{ ['--th-altura' as string]: `${altura}px` }}>
          {variante === 'altos' && !custom ? (
            <div className="th-modos-altos">
              <button type="button" className={`${bloco.bloco} ${esc.modo}`} data-marcado="true" onClick={() => setCustom(false)}>
                <b className="th-nome">Todos os cartões</b>
                <span className="th-grande">412</span>
                <span className={esc.apoio}>Tudo o que está no acervo, de todos os anos.</span>
              </button>
              <button type="button" className={`${bloco.bloco} ${esc.modo}`} data-marcado="false" onClick={() => setCustom(true)}>
                <b className="th-nome">Personalizado</b>
                <span className={esc.apoio}>Escolha anos, bimestres, disciplinas ou aulas.</span>
                <span className={esc.pe}>Nenhum filtro marcado</span>
              </button>
            </div>
          ) : (
            <>
              <div className={`${esc.par} th-fixo`}>
                <Modo nome="Todos os cartões" texto="Tudo o que está no acervo, de todos os anos." pe="412 cartões" sel={!custom} onClick={() => setCustom(false)} />
                <Modo nome="Personalizado" texto="Escolha anos, bimestres, disciplinas ou aulas." pe={custom ? '38 cartões' : 'Nenhum filtro marcado'} sel={custom} onClick={() => setCustom(true)} />
              </div>
              {custom ? <Personalizado /> : <Meio variante={variante} />}
            </>
          )}
          <Barra custom={custom} />
        </div>
      </div>
    </div>
  );
}
