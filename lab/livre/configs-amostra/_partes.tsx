// Bancada "configs-amostra" (14/11, R2 Configs): escolha com amostra e grupo Cartões, o que a D144 deixou de fora.
// V1 pílulas com amostra na linha · V2 grade de miniaturas · V3 lista de hoje + prévia ao vivo.
import { useEffect, useState, type ReactNode } from 'react';
import './cfg.css';

export type Escolhas = {
  tema: 'claro' | 'escuro';
  paleta: 'original' | 'a' | 'b';
  cantos: 'arredondado' | 'contido';
  animacao: 'elastico' | 'nenhuma';
  menu: 'numeros' | 'numIcone' | 'icones' | 'numCima' | 'numBaixo';
  tamanho: 'padrao' | 'compacto';
  corTitulos: 'sim' | 'nao';
};

export type Chave = keyof Escolhas;

export type Ajuste = {
  chave: Chave;
  grupo?: string;
  rotulo: string;
  detalhe: string;
  opcoes: readonly { v: string; nome: string }[];
};

export const AJUSTES: readonly Ajuste[] = [
  {
    chave: 'tema',
    grupo: 'Cores',
    rotulo: 'Tema',
    detalhe: 'Claro ou escuro, neste aparelho.',
    opcoes: [
      { v: 'claro', nome: 'Claro' },
      { v: 'escuro', nome: 'Escuro' },
    ],
  },
  {
    chave: 'paleta',
    rotulo: 'Paleta de cores',
    detalhe: 'Tom do fundo e da cor de ação.',
    opcoes: [
      { v: 'original', nome: 'Gelo suave' },
      { v: 'a', nome: 'Gelo' },
      { v: 'b', nome: 'Índigo' },
    ],
  },
  {
    chave: 'cantos',
    rotulo: 'Cantos',
    detalhe: 'Mais redondos ou mais retos.',
    opcoes: [
      { v: 'arredondado', nome: 'Arredondado' },
      { v: 'contido', nome: 'Contido' },
    ],
  },
  {
    chave: 'animacao',
    grupo: 'Barra do topo',
    rotulo: 'Animação',
    detalhe: 'Ao trocar de tela.',
    opcoes: [
      { v: 'elastico', nome: 'Elástico' },
      { v: 'nenhuma', nome: 'Nenhuma' },
    ],
  },
  {
    chave: 'menu',
    rotulo: 'Menu de telas',
    detalhe: 'Como as telas aparecem na barra.',
    opcoes: [
      { v: 'numeros', nome: 'Só números' },
      { v: 'numIcone', nome: 'Número e ícone' },
      { v: 'icones', nome: 'Só ícones' },
      { v: 'numCima', nome: 'Número em cima' },
      { v: 'numBaixo', nome: 'Número embaixo' },
    ],
  },
  {
    chave: 'tamanho',
    grupo: 'Cartões',
    rotulo: 'Tamanho do cartão',
    detalhe: 'Na Mesa e no Treino.',
    opcoes: [
      { v: 'padrao', nome: 'Padrão' },
      { v: 'compacto', nome: 'Compacto' },
    ],
  },
  {
    chave: 'corTitulos',
    rotulo: 'Cor nos títulos',
    detalhe: 'Títulos do verso na cor de ação.',
    opcoes: [
      { v: 'sim', nome: 'Com cor' },
      { v: 'nao', nome: 'Sem cor' },
    ],
  },
];

export const INICIO: Escolhas = {
  tema: 'claro',
  paleta: 'original',
  cantos: 'arredondado',
  animacao: 'elastico',
  menu: 'numIcone',
  tamanho: 'padrao',
  corTitulos: 'sim',
};

export const nomeDe = (a: Ajuste, e: Escolhas) =>
  a.opcoes.find((o) => o.v === e[a.chave])?.nome ?? '';

export function useEscolhas() {
  const [e, setE] = useState<Escolhas>(() => ({ ...INICIO, tema: document.documentElement.dataset.tema === 'escuro' ? 'escuro' : 'claro' }));
  const [sel, setSel] = useState<Chave>('paleta');
  const mudar = (k: Chave, v: string) => setE((x) => ({ ...x, [k]: v }));
  // A escolha de tema segue o tema da moldura (na tela real são a mesma coisa).
  useEffect(() => {
    const raiz = document.documentElement;
    const seguir = () => mudar('tema', raiz.dataset.tema === 'escuro' ? 'escuro' : 'claro');
    seguir();
    const obs = new MutationObserver(seguir);
    obs.observe(raiz, { attributes: true, attributeFilter: ['data-tema'] });
    return () => obs.disconnect();
  }, []);
  const ciclar = (a: Ajuste) => {
    const i = a.opcoes.findIndex((o) => o.v === e[a.chave]);
    mudar(a.chave, a.opcoes[(i + 1) % a.opcoes.length]!.v);
  };
  return { e, sel, setSel, mudar, ciclar };
}

// Cores das paletas copiadas de tokens.css e paletas.css só para as miniaturas (a página real usa as do tema aberto).
const COR = {
  original: {
    claro: ['#e7edf4', '#f7fafd', '#426cc0', '#d3e0f4'],
    escuro: ['#0c121c', '#141c2a', '#94b4ea', '#2f4878'],
  },
  a: {
    claro: ['#e9eef5', '#f8fafd', '#121a2b', '#cfdcf3'],
    escuro: ['#0b111c', '#131b2a', '#86a8ee', '#2e4a85'],
  },
  b: {
    claro: ['#e9ecf2', '#f8f9fc', '#5766c0', '#d7dcf4'],
    escuro: ['#0f1119', '#181b26', '#9aa6ea', '#36407c'],
  },
} as const;

export function varsDe(e: Pick<Escolhas, 'tema' | 'paleta' | 'cantos'>) {
  const [fundo, cartao, acao, escolhido] = COR[e.paleta][e.tema];
  const claro = e.tema === 'claro';
  const contido = e.cantos === 'contido';
  return {
    '--m-fundo': fundo,
    '--m-cartao': cartao,
    '--m-acao': acao,
    '--m-escolhido': escolhido,
    '--m-texto': claro ? '#1b2433' : '#e2e8f2',
    '--m-texto2': claro ? '#9aa6b8' : '#4d5a6e',
    '--m-sobre': claro ? '#ffffff' : '#0c121c',
    '--m-raio-bloco': contido ? '5px' : '9px',
    '--m-raio-peca': contido ? '2px' : '5px',
  } as React.CSSProperties;
}

const ABAS = [0, 1, 2, 3];

function Abas({ menu }: { menu: Escolhas['menu'] }) {
  return (
    <span className="cg-m-abas" data-menu={menu}>
      {ABAS.map((i) => (
        <span key={i} className="cg-m-aba" data-on={i === 1}>
          {menu !== 'numeros' && <i className="cg-m-ico" />}
          {menu !== 'icones' && <b className="cg-m-num">{i + 1}</b>}
        </span>
      ))}
    </span>
  );
}

// Miniatura da Mesa: barra do topo, dois blocos e um cartão de estudo.
export function Mini({ e, foco, so }: { e: Escolhas; foco?: boolean; so?: 'barra' | 'cartao' }) {
  const compacto = e.tamanho === 'compacto';
  const cartao = (
    <div className="cg-m-card" data-compacto={compacto}>
      <div className="cg-m-faixa">
        <i />
        <i data-curta />
      </div>
      <div className="cg-m-verso">
        <b data-cor={e.corTitulos === 'sim'} />
        <i />
        <i data-curta />
        <b data-cor={e.corTitulos === 'sim'} />
        <i />
      </div>
    </div>
  );
  return (
    <div className="cg-mini" style={varsDe(e)} data-foco={foco} data-so={so}>
      {so !== 'cartao' && (
        <div className="cg-m-topo">
          <Abas menu={e.menu} />
          <span className="cg-m-titulo" />
        </div>
      )}
      {so === 'barra' ? null : so === 'cartao' ? (
        cartao
      ) : (
        <div className="cg-m-blocos">
          <div className="cg-m-bloco">
            <i />
            <i data-curta />
            <i />
          </div>
          <div className="cg-m-bloco">{cartao}</div>
        </div>
      )}
    </div>
  );
}

const SECOES = ['Aparência', 'Atalhos', 'Sincronização', 'Backup', 'Segurança', 'Sobre'];

// Moldura da tela: Seções à esquerda (Aparência acesa), Detalhe à direita, como em Configs.tsx.
export function Tela({
  nota,
  children,
  lado,
  secoes,
}: {
  nota: string;
  children: ReactNode;
  lado?: ReactNode;
  secoes?: [string, string][];
}) {
  return (
    <div className="cg-tela">
      <p className="cg-nota">{nota}</p>
      <div className="cg-colunas" data-lado={Boolean(lado)}>
        <section className="cg-bloco">
          <h2 className="cg-bt">Seções</h2>
          <div className="cg-lista">
            {secoes
              ? secoes.map(([s, d], i) => (
                  <div key={s} className="cg-secao cf-secao" data-sel={i === 0}><b>{s}</b><span className="cg-det">{d}</span></div>
                ))
              : SECOES.map((s, i) => (
                  <div key={s} className="cg-secao" data-sel={i === 0}>{s}</div>
                ))}
          </div>
        </section>
        <section className="cg-bloco" data-aceso>
          <h2 className="cg-bt">Aparência</h2>
          <div className="cg-lista">{children}</div>
        </section>
        {lado}
      </div>
    </div>
  );
}

export const Grupo = ({ t }: { t: string }) => <h3 className="cg-grupo">{t}</h3>;
