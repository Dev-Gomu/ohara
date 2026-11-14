// V1 do Fable (bancada de 13/11, aprovada na D144) refeita, agora com Cantos e o grupo Cartões completo.
import { ScreenIcon } from '../../../src/ui/components/ScreenIcon';
import type { ReactNode } from 'react';
import { GrupoCartoes, type Variante } from './_cartoes';
import { Mini, Tela, useEscolhas, type Chave, type Escolhas } from './_partes';

const SECOES: [string, string][] = [
  ['Aparência', 'Tema, paleta, barra do topo, cartões'],
  ['Atalhos', 'Lista gerada da tabela de teclas'],
  ['Sincronização', 'Google Drive · em breve'],
  ['Backup', 'Exportar, importar, limpar arquivos'],
  ['Segurança', 'Frase de acesso das Notas · em breve'],
  ['Sobre', 'Versão, banco e espaço usado'],
];

const PALETAS: { v: Escolhas['paleta']; nome: string; claro: string[]; escuro: string[] }[] = [
  { v: 'original', nome: 'Gelo suave', claro: ['#e7edf4', '#f7fafd', '#426cc0'], escuro: ['#0c121c', '#141c2a', '#94b4ea'] },
  { v: 'a', nome: 'Gelo', claro: ['#e9eef5', '#f8fafd', '#121a2b'], escuro: ['#0b111c', '#131b2a', '#86a8ee'] },
  { v: 'b', nome: 'Índigo', claro: ['#e9ecf2', '#f8f9fc', '#5766c0'], escuro: ['#0f1119', '#181b26', '#9aa6ea'] },
];

const MENUS: { v: Escolhas['menu']; nome: string }[] = [
  { v: 'numeros', nome: 'Só números' },
  { v: 'numIcone', nome: 'Número e ícone' },
  { v: 'icones', nome: 'Só ícones' },
  { v: 'numCima', nome: 'Número em cima' },
  { v: 'numBaixo', nome: 'Número embaixo' },
];

function Aba({ menu, n, on }: { menu: Escolhas['menu']; n: number; on?: boolean }) {
  const tela = n === 1 ? 'hub' : 'mesa';
  return (
    <span className="cf-aba" data-on={on}>
      {menu !== 'numeros' && <ScreenIcon screen={tela} />}
      {menu === 'numCima' ? <sup>{n}</sup> : menu === 'numBaixo' ? <sub>{n}</sub> : menu !== 'icones' && <span>{n}</span>}
    </span>
  );
}

// Linha com duas ou três escolhas curtas à direita (como Tema na bancada do Fable).
function Par({ k, rotulo, detalhe, opcoes, e, sel, setSel, mudar }: {
  k: Chave; rotulo: string; detalhe?: string; opcoes: [string, string][]; e: Escolhas; sel: Chave; setSel: (k: Chave) => void; mudar: (k: Chave, v: string) => void;
}) {
  return (
    <div className="cf-linha" data-sel={sel === k} onClick={() => setSel(k)}>
      <span className="cg-texto"><b>{rotulo}</b>{detalhe && <span className="cg-det">{detalhe}</span>}</span>
      <span className="cf-par">
        {opcoes.map(([v, nome]) => (
          <button key={v} className="cf-par-op" data-on={e[k] === v} onClick={() => mudar(k, v)}>{nome}</button>
        ))}
      </span>
    </div>
  );
}

// Escolha com desenho do cartão, no mesmo molde da paleta e do menu de telas (desenho, marca e nome).
function Ilustrada({ k, rotulo, detalhe, opcoes, e, sel, setSel, mudar }: {
  k: Chave; rotulo: string; detalhe: string; opcoes: [string, string][]; e: Escolhas; sel: Chave; setSel: (k: Chave) => void; mudar: (k: Chave, v: string) => void;
}) {
  return (
    <div className="cf-bloco" data-sel={sel === k} onClick={() => setSel(k)}>
      <span className="cg-texto"><b>{rotulo}</b><span className="cg-det">{detalhe}</span></span>
      <span className="cf-amostras">
        {opcoes.map(([v, nome]) => (
          <button key={v} className="cf-amostra" data-on={e[k] === v} onClick={() => mudar(k, v)}>
            <span className="cf-glifo" data-compacto={(k === 'tamanho' ? v : e.tamanho) === 'compacto'} data-cor={(k === 'corTitulos' ? v : e.corTitulos) === 'sim'}>
              <i className="cf-g-faixa" /><b /><i /><i /><b /><i />
            </span>
            <span className="cf-nome"><i className="cf-marca" />{nome}</span>
          </button>
        ))}
      </span>
    </div>
  );
}

// Grupo com título; no modo "grupo", a amostra do grupo fica à esquerda e muda com as escolhas.
function Grupo({ nome, mini, children }: { nome: string; mini: ReactNode; children: ReactNode }) {
  if (!mini) return (<><h3 className="cg-grupo">{nome}</h3>{children}</>);
  return (
    <div className="cf-grupo">
      <div className="cf-grupo-amostra"><h3 className="cg-grupo">{nome}</h3>{mini}</div>
      <div className="cf-grupo-linhas">{children}</div>
    </div>
  );
}

export type Modo = 'so' | 'grupo' | 'lado';

export function Fable({ modo = 'so', nota, cartoes }: { modo?: Modo; nota: string; cartoes: Variante }) {
  const { e, sel, setSel, mudar } = useEscolhas();
  const p = { e, sel, setSel, mudar };
  return (
    <Tela
      nota={nota}
      secoes={SECOES}
      lado={
        modo === 'lado' ? (
          <section className="cg-bloco cg-v3-previa">
            <h2 className="cg-bt">Prévia</h2>
            <div className="cg-v3-palco"><Mini e={e} /></div>
            <p className="cg-v3-legenda">Muda na hora, junto com cada escolha.</p>
          </section>
        ) : undefined
      }
    >
      <Grupo nome="Cores" mini={modo === 'grupo' ? <Mini e={e} /> : null}>
      <Par k="tema" rotulo="Tema" detalhe="Claro ou escuro, neste aparelho." opcoes={[['claro', 'Claro'], ['escuro', 'Escuro']]} {...p} />
      <div className="cf-bloco" data-sel={sel === 'paleta'} onClick={() => setSel('paleta')}>
        <span className="cg-texto"><b>Paleta de cores</b><span className="cg-det">Muda os azuis e as cores das matérias.</span></span>
        <span className="cf-amostras">
          {PALETAS.map((pa) => (
            <button key={pa.v} className="cf-amostra" data-on={e.paleta === pa.v} onClick={() => mudar('paleta', pa.v)}>
              <span className="cf-cores">{pa[e.tema].map((c) => <i key={c} style={{ background: c }} />)}</span>
              <span className="cf-nome"><i className="cf-marca" />{pa.nome}</span>
            </button>
          ))}
        </span>
      </div>
      <Par k="cantos" rotulo="Cantos" detalhe="Mais redondos ou mais retos." opcoes={[['arredondado', 'Arredondado'], ['contido', 'Contido']]} {...p} />
      </Grupo>

      <Grupo nome="Barra do topo" mini={modo === 'grupo' ? <Mini e={e} so={'barra'} /> : null}>
      <div className="cf-bloco" data-sel={sel === 'menu'} onClick={() => setSel('menu')}>
        <span className="cg-texto"><b>Menu de telas</b><span className="cg-det">Como as abas das telas aparecem.</span></span>
        <span className="cf-amostras">
          {MENUS.map((m) => (
            <button key={m.v} className="cf-amostra" data-on={e.menu === m.v} onClick={() => mudar('menu', m.v)}>
              <span className="cf-abas"><Aba menu={m.v} n={1} /><Aba menu={m.v} n={2} on /></span>
              <span className="cf-nome"><i className="cf-marca" />{m.nome}</span>
            </button>
          ))}
        </span>
      </div>
      <Par k="animacao" rotulo="Animação na troca de tela" opcoes={[['elastico', 'Elástico'], ['nenhuma', 'Nenhuma']]} {...p} />
      </Grupo>

      <Grupo nome="Cartões" mini={modo === 'grupo' ? <Mini e={e} so={'cartao'} /> : null}>
      <GrupoCartoes variante={cartoes} {...p} />
      </Grupo>
    </Tela>
  );
}
