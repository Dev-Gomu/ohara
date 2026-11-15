// Bancada "Treino em dois modos" (inspirada no protótipo do ChatGPT): Todos os cartões (padrão)
// ou Personalizado, que abre os filtros. Peças e classes reais do app; só o arranjo é novo.
// Caso extremo: 14 disciplinas, 6 anos, aula de nome longo.
import bloco from '../../../src/ui/components/Block.module.css';
import { Button } from '../../../src/ui/components/Button';
import { Key } from '../../../src/ui/components/Key';
import { SubjectPill } from '../../../src/ui/components/Pill';
import inicio from '../../../src/ui/screens/treino/Inicio.module.css';
import treino from '../../../src/ui/screens/treino/Treino.module.css';
import { ACERVO_MATERIAS } from '../../_dados';
import './tm.css';

const MATERIAS = [...ACERVO_MATERIAS, { sigla: 'MIC', cor: 2 }, { sigla: 'EMB', cor: 4 }];
const HOJE: Record<string, number> = { IMU: 8, GEN: 1, PRO: 1, APS: 1, FIS: 3 };
const MARCADAS = ['IMU', 'FIS'];
const ANOS = ['1º', '2º', '3º', '4º', '5º', '6º'];
const BIMESTRES = ['1º', '2º', '3º', '4º'];
const AULAS = [
  { tipo: 'folder', sigla: 'IMU', cor: 2, nome: '1º bimestre', info: '5 hoje', ok: false },
  { tipo: 'lesson', nome: 'Resposta imune inata', info: '3 hoje', ok: true },
  { tipo: 'lesson', nome: 'Complemento e vias de ativação clássica e alternativa', info: '2 hoje', ok: true },
  { tipo: 'lesson', nome: 'Imunidade adaptativa', info: 'em dia', ok: false },
  { tipo: 'folder', sigla: 'FIS', cor: 5, nome: '1º bimestre', info: '3 hoje', ok: false },
  { tipo: 'lesson', nome: 'Potencial de ação', info: '3 hoje', ok: false },
  { tipo: 'lesson', nome: 'Contração muscular', info: 'em dia', ok: false },
  { tipo: 'lesson', nome: 'Sinapses', info: 'em dia', ok: false },
] as const;

function Visto() {
  return (
    <svg className="tm-visto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Escolha única: marcada só pelo fundo, como toda régua do app.
function Modo({ nome, texto, pe, sel }: { nome: string; texto: string; pe: string; sel: boolean }) {
  return (
    <button type="button" className={`${bloco.bloco} tm-modo`} data-sel={sel} aria-pressed={sel}>
      <b className="tm-modo-nome">{nome}</b>
      <span className="tm-apoio">{texto}</span>
      <span className="tm-pe">{pe}</span>
    </button>
  );
}

// Régua do app (ilha recuada); aceita vários, por isso o escolhido leva o visto.
function Regua({ rotulo, itens, marcados }: { rotulo: string; itens: string[]; marcados: number[] }) {
  return (
    <div className={`${bloco.bloco} tm-faixa`}>
      <span className={`${inicio.rotulo} tm-rotulo`}>{rotulo}</span>
      <div className={`${inicio.regua} tm-ilha`}>
        {itens.map((t, i) => (
          <button type="button" key={t} className={`${inicio.periodoItem} tm-item`} data-sel={marcados.includes(i)} role="checkbox" aria-checked={marcados.includes(i)}>
            {marcados.includes(i) && <Visto />}
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function Disciplinas({ marcadas, cursor }: { marcadas: string[]; cursor: string }) {
  return (
    <div className={`${bloco.bloco} tm-disc`} data-foco="dentro">
      <div className={inicio.buscaForm}>
        <span className={inicio.rotulo}>Disciplina</span>
        <input className={inicio.campo} placeholder="Digite a sigla ou o nome" readOnly />
        <Key>Alt F</Key>
      </div>
      <div className={`${inicio.grade} tm-grade`}>
        {MATERIAS.map((m) => {
          const sel = marcadas.includes(m.sigla);
          return (
            <button type="button" key={m.sigla} className={`${inicio.peca} tm-peca`} data-sel={sel} role="checkbox" aria-checked={sel} data-cursor={m.sigla === cursor ? '' : undefined}>
              {sel && <span className="tm-selo"><Visto /></span>}
              <SubjectPill code={m.sigla} color={m.cor} />
              <b className={inicio.contagem}>{HOJE[m.sigla] ?? ''}</b>
              <small className={inicio.situacao}>{HOJE[m.sigla] ? 'hoje' : 'em dia'}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Aulas({ vazio }: { vazio: boolean }) {
  // Sem disciplina marcada: o bloco fica apagado e diz o que fazer, em vez de listar tudo.
  if (vazio)
    return (
      <div className={`${bloco.bloco} tm-aulas`}>
        <header className={bloco.titulo}><h2 className={bloco.nome}>Aulas</h2></header>
        <p className={`${inicio.legenda} tm-vazio`}>Marque uma disciplina para escolher aulas.</p>
      </div>
    );
  return (
    <div className={`${bloco.bloco} tm-aulas`}>
      <header className={bloco.titulo}>
        <h2 className={bloco.nome}>Aulas</h2>
        <div className={bloco.fim}><span className={treino.contagem}>2 de 6</span></div>
      </header>
      <div className={`${treino.lista} tm-lista`}>
        {AULAS.map((l) =>
          l.tipo === 'folder' ? (
            <div key={l.sigla} className="tm-grupo">
              <SubjectPill code={l.sigla} color={l.cor} />
              <b className="tm-grupo-nome">{l.nome}</b>
              <span className={treino.contagem}>{l.info}</span>
            </div>
          ) : (
            <div key={l.nome} className={`${treino.linha} tm-linha`}>
              <span className={treino.marca} data-tipo="lesson" aria-checked={l.ok}>{l.ok && <Visto />}</span>
              <span className="tm-aula">{l.nome}</span>
              <span className={treino.contagem}>{l.info}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export function Tela({ estado, titulo, nota }: { estado: 'tudo' | 'filtros' | 'vazio'; titulo: string; nota: string }) {
  const vazio = estado === 'vazio';
  const filtros = estado !== 'tudo';
  return (
    <div className="tm">
      <p className="tm-tit"><b>{titulo}</b> {nota}</p>
      <div className="tm-tela">
        <div className="tm-pilha">
          <div className="tm-par" role="group" aria-label="Como treinar">
            <Modo nome="Todos os cartões" texto="Tudo o que está no acervo, de todos os anos." pe="412 cartões" sel={!filtros} />
            <Modo nome="Personalizado" texto="Escolha anos, bimestres, disciplinas ou aulas." pe={vazio ? 'Nenhum cartão' : filtros ? '38 cartões' : 'Nenhum filtro marcado'} sel={filtros} />
          </div>

          {filtros && (
            <>
              <div className="tm-par">
                <Regua rotulo="Ano" itens={ANOS} marcados={vazio ? [] : [1]} />
                <Regua rotulo="Bimestre" itens={BIMESTRES} marcados={vazio ? [3] : [0]} />
              </div>
              <div className="tm-par">
                <Disciplinas marcadas={vazio ? [] : MARCADAS} cursor={vazio ? 'GEN' : 'FIS'} />
                <Aulas vazio={vazio} />
              </div>
            </>
          )}

          <div className={`${bloco.bloco} tm-barra`} data-foco={filtros ? undefined : 'dentro'}>
            <span className="tm-numero">{vazio ? 0 : filtros ? 5 : 14}</span>
            <span className="tm-resumo">
              <b className="tm-recorte">cartões para hoje</b>
              <span className="tm-apoio">{vazio ? 'Nenhum cartão com estes filtros' : filtros ? '2 novos' : '5 novos'}</span>
            </span>
            {filtros && <Button variant="quiet">Limpar filtros</Button>}
            {vazio ? <Button disabled>Nada para treinar</Button> : <Button variant="primary" shortcut="Enter" cursor={!filtros}>Iniciar treino</Button>}
            {!filtros && <button type="button" className={bloco.opcoes} aria-label="Opções">⋮</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
