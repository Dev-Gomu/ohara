// Partes comuns das três versões da Mesa (bancada R3). Só desenho: nada aqui liga no teclado.
// Query extra: &foco=notas|slides|cartoes (padrão notas, no campo) &cartoes=novo|salvos.
import type { ReactNode } from 'react';
import { SCREENS } from '../../../src/core/keyboard/actions';
import { SCREEN_NAMES } from '../../../src/core/keyboard/keys';
import { Block } from '../../../src/ui/components/Block';
import { BlockIcon, type IconName } from '../../../src/ui/components/BlockIcon';
import { Button } from '../../../src/ui/components/Button';
import { CardBack, Inline } from '../../../src/ui/components/CardBack';
import { Island, LevelIndicator, Tab } from '../../../src/ui/components/Island';
import { Key } from '../../../src/ui/components/Key';
import { SubjectPill } from '../../../src/ui/components/Pill';
import { ScreenIcon } from '../../../src/ui/components/ScreenIcon';
import { BlockTab, BlockTabs, BlockToggle, ToggleGroup } from '../../../src/ui/components/Toggles';
import frame from '../../../src/ui/shell/ScreenFrame.module.css';
import cartoes from '../../../src/ui/screens/mesa/CardsBlock.module.css';
import mesa from '../../../src/ui/screens/mesa/Mesa.module.css';
import './mesa.css';

const pedido = new URLSearchParams(location.search);
export const FOCO = pedido.get('foco') ?? 'notas';
export const MODO = pedido.get('cartoes') ?? 'novo';

// Caso extremo: título comprido.
export const AULA = {
  titulo: 'Hipersensibilidades tipo I a IV e doenças autoimunes associadas',
  sigla: 'IMU',
  cor: 2,
  data: 'qua, 4 nov',
  pagina: 3,
  paginas: 24,
};

export const BLOCOS = [
  { id: 'slides', nome: 'Slides', letra: 'S', icone: 'slides' as IconName },
  { id: 'notas', nome: 'Anotações', letra: 'A', icone: 'notas' as IconName },
  { id: 'cartoes', nome: 'Cartões', letra: 'C', icone: 'cartoes' as IconName },
];

export const fixo = (id: string): 'none' | 'block' | 'inside' =>
  FOCO !== id ? 'none' : id === 'notas' ? 'inside' : 'block';

// ---------- Barra do topo ----------
const MENU = pedido.get('menu') === 'aberto';

const Traco = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
// Faltas: calendário com X. Notas: folha do boletim. Mais: três traços curtos.
const IconeFaltas = () => (
  <Traco>
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M8 3v4M16 3v4M9.5 11l5 5M14.5 11l-5 5" />
  </Traco>
);
const IconeNotas = () => (
  <Traco>
    <rect x="5" y="3" width="14" height="18" rx="3" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Traco>
);
const IconeMais = () => (
  <Traco>
    <path d="M5 7h14M5 12h14M5 17h14" />
  </Traco>
);

interface TopoProps {
  alternadores: 'icones' | 'so-icones';
  fim: 'icones' | 'menu';
  fonte?: string;
}

export function Topo({ alternadores, fim, fonte = 'var(--voz-titulo)' }: TopoProps) {
  return (
    <nav className={frame.topo}>
      <Island label="Telas">
        {SCREENS.map((id, i) => (
          <Tab key={id} number={i + 1} name={SCREEN_NAMES[id]} current={id === 'mesa'} icon={<ScreenIcon screen={id} />} />
        ))}
      </Island>
      <span className="m-sigla">
        <SubjectPill code={AULA.sigla} color={AULA.cor} />
      </span>
      <h1 className={frame.titulo} data-caps="false" style={{ marginLeft: 0, font: fonte }}>
        {AULA.titulo}
      </h1>
      <div className={frame.fim}>
        <div className="m-grupo" role="group" aria-label="Blocos">
          {BLOCOS.map((b) => (
            <button key={b.id} type="button" className="m-alt" data-so={alternadores === 'so-icones'} title={`${b.nome} · Alt ${b.letra}`}>
              <span className="m-alt-icone">
                <BlockIcon name={b.icone} />
              </span>
              {alternadores === 'icones' && <Key>{b.letra}</Key>}
            </button>
          ))}
        </div>
        <LevelIndicator
          level={FOCO === 'notas' ? 'field' : 'block'}
          keys={FOCO === 'notas' ? ['Esc sobe'] : ['Enter entra', 'Esc sobe']}
        />
        {fim === 'icones' ? (
          <>
            <button type="button" className="m-icone" title="Faltas" aria-label="Faltas">
              <IconeFaltas />
            </button>
            <button type="button" className="m-icone" title="Notas" aria-label="Notas">
              <IconeNotas />
            </button>
            <button type="button" className="m-icone m-icone-texto" title="Ajuda" aria-label="Ajuda">
              ?
            </button>
          </>
        ) : (
          <span className="m-mais">
            <button type="button" className="m-icone" data-sel={MENU} title="Mais" aria-label="Mais">
              <IconeMais />
            </button>
            {MENU && (
              <div className="m-menu" role="menu">
                <button type="button" role="menuitem" data-cursor="">
                  <IconeFaltas /> Faltas
                </button>
                <button type="button" role="menuitem">
                  <IconeNotas /> Notas
                </button>
                <button type="button" role="menuitem">
                  <span className="m-menu-sinal">?</span> Ajuda <Key>Alt /</Key>
                </button>
              </div>
            )}
          </span>
        )}
      </div>
    </nav>
  );
}

// Os três blocos, iguais nas três versões: aqui só a barra do topo muda.
export function Blocos() {
  return (
    <>
      <Block id="slides" title="Slides" icon="slides" tools={<Passador />} shortcut="Alt S" menu fixed={fixo('slides')}>
        <Slide />
      </Block>
      <Block id="notas" title="Anotações" icon="notas" shortcut="Alt A" menu fixed={fixo('notas')}>
        <Nota />
      </Block>
      <Block id="cartoes" title="Cartões" icon="cartoes" tools={<AbasCartoes />} shortcut="Alt C" menu fixed={fixo('cartoes')}>
        <Cartoes />
      </Block>
    </>
  );
}

export function Tela({ topo, children }: { topo: ReactNode; children: ReactNode }) {
  return (
    <div className={`${frame.tela} m-tela`}>
      {topo}
      <div className="m-mosaico">{children}</div>
    </div>
  );
}

// ---------- Slides ----------
export function Slide() {
  return (
    <div className={mesa.pagina}>
      <div className="m-slide">
        <b>Hipersensibilidade tipo I</b>
        <ul>
          <li>Mediada por IgE, mastócitos e basófilos</li>
          <li>Fase imediata: histamina (minutos)</li>
          <li>Fase tardia: eosinófilos (6 a 24 h)</li>
        </ul>
        <small>Imunologia · aula 9</small>
      </div>
    </div>
  );
}

export function Passador({ flutua }: { flutua?: boolean }) {
  return (
    <div
      className={`m-grupo m-passador ${flutua ? 'm-flutua' : ''}`}
      role="group"
      aria-label="Página"
    >
      <button type="button" className="m-passo" aria-label="Página anterior">
        ‹
      </button>
      <span className="m-pagina">
        {AULA.pagina} de {AULA.paginas}
      </span>
      <button type="button" className="m-passo" aria-label="Próxima página">
        ›
      </button>
    </div>
  );
}

// ---------- Anotações ----------
export function Nota({ cabeca }: { cabeca?: ReactNode }) {
  return (
    <div className={mesa.editor}>
      <div className={mesa.texto}>
        {cabeca}
        <h2>Tipo I (imediata)</h2>
        <p>
          O alérgeno liga a IgE presa ao mastócito pelo <mark>FcεRI</mark> e provoca a degranulação.
          A histamina aumenta a permeabilidade e contrai o músculo liso do brônquio.
        </p>
        <ul>
          <li>Fase imediata: minutos, histamina e triptase.</li>
          <li>Fase tardia: 6 a 24 horas, eosinófilos e leucotrienos.</li>
        </ul>
        <h2>Tipo II (citotóxica)</h2>
        <p>
          IgG ou IgM contra antígeno fixo na célula. Exemplos: anemia hemolítica autoimune, doença
          hemolítica do recém-nascido e <mark>miastenia gravis</mark>.
        </p>
        <h2>Tipo III (imunocomplexos)</h2>
        <p>
          Complexos circulantes depositam em vaso, rim e articulação. Lúpus e glomerulonefrite
          pós-estreptocócica.
        </p>
        <h2>Tipo IV (tardia)</h2>
        <p>Linfócitos T, 48 a 72 horas. PPD e dermatite de contato.</p>
      </div>
    </div>
  );
}

const FERRAMENTAS = ['N', 'I', 'S', 'Marca', 'T1', 'T2', 'Lista', 'Tarefas'];

export function Ferramentas() {
  return (
    <div className={mesa.ferramentas} role="toolbar" aria-label="Formatação">
      {FERRAMENTAS.map((nome) => (
        <button key={nome} type="button" className={mesa.ferramenta} data-sel={nome === 'T2'}>
          {nome}
        </button>
      ))}
    </div>
  );
}

// ---------- Cartões ----------
const SALVOS = [
  { p: 'Quem medeia a hipersensibilidade tipo I?', r: 'IgE, mastócitos e basófilos' },
  { p: 'Exemplo de tipo II?', r: '- Miastenia gravis\n- Anemia hemolítica autoimune' },
  { p: 'Onde depositam os imunocomplexos?', r: 'Vaso, rim e articulação' },
  { p: 'Tempo da reação tipo IV?', r: '48 a 72 horas' },
  { p: 'O que o PPD testa?', r: 'Hipersensibilidade tardia (linfócitos T)' },
  { p: 'Mediador da fase imediata?', r: 'Histamina' },
];
const CORES = ['roxo', 'rosa', 'azul', 'verde'];
const SINAIS: [string, string][] = [
  ['@', 'frente'],
  ['#', 'seção'],
  ['-', 'item'],
  ['1.', 'número'],
  ['+', 'a favor'],
  ['--', 'contra'],
  ['?', 'dúvida'],
];

export function AbasCartoes() {
  return (
    <BlockTabs label="Cartões">
      <BlockTab selected={MODO === 'novo'} onPress={() => {}}>
        Novo
      </BlockTab>
      <BlockTab selected={MODO === 'salvos'} count={SALVOS.length} onPress={() => {}}>
        Salvos
      </BlockTab>
    </BlockTabs>
  );
}

export function Cartoes() {
  if (MODO === 'salvos') {
    return (
      <div className={cartoes.cartoes}>
        {SALVOS.map((c, i) => (
          <div
            key={c.p}
            className={`${cartoes.cartao} ${FOCO === 'cartoes' && i === 1 ? 'm-cursor' : ''}`}
            data-cor={CORES[i % CORES.length]}
          >
            <span className={cartoes.pergunta}>
              <Inline text={c.p} />
            </span>
            <CardBack back={c.r} compact />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={cartoes.criar}>
      <div className={cartoes.criarGrade}>
        <textarea
          className={cartoes.texto}
          readOnly
          value={
            '@ Quem medeia a tipo I?\nIgE, mastócitos e basófilos\n# Fases\n- Imediata: histamina\n- Tardia: eosinófilos\n\n@ Exemplo de tipo III?'
          }
        />
        <div className={cartoes.rascunhos}>
          <article className={cartoes.rascunho}>
            <p className={cartoes.frente}>Quem medeia a tipo I?</p>
            <CardBack
              back={
                'IgE, mastócitos e basófilos\n# Fases\n- Imediata: histamina\n- Tardia: eosinófilos'
              }
              compact
            />
          </article>
          <article className={cartoes.rascunho} data-incompleto="true">
            <p className={cartoes.frente}>Exemplo de tipo III?</p>
            <p className={cartoes.falta}>Falta o verso</p>
          </article>
        </div>
      </div>
      <footer className="m-rodape">
        <p className="m-sinais">
          {SINAIS.map(([sinal, nome]) => (
            <span key={sinal}>
              <Key>{sinal}</Key> {nome}
            </span>
          ))}
        </p>
        <Button variant="primary" shortcut="Ctrl Enter">
          Salvar 1
        </Button>
      </footer>
    </div>
  );
}

export { Block, Key, SubjectPill };
