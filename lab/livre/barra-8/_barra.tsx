// Barra de 8: Título, Marca-texto, Tópicos, Numerada, Tabela, Desfazer + dois botões duplos (Negrito/Itálico, Sobrescrito/Subscrito) + Aa.
// V1: dois botões que abrem balão. V2: negrito e itálico soltos, só sobrescrito/subscrito em balão. V3: botão dividido (toque direto + seta do balão).
import { useState, type ReactNode } from 'react';
import bloco from '../../../src/ui/components/Block.module.css';
import mesa from '../../../src/ui/screens/mesa/Mesa.module.css';
import './barra.css';

const S = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const IC: Record<string, ReactNode> = {
  titulo: <b>H</b>,
  marca: <S><path d="M13 4l5 5-7 7H6v-5zM4 21h16" /></S>,
  topicos: <S><path d="M10 6h10M10 12h10M10 18h10M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></S>,
  numerada: <S><path d="M11 6h9M11 12h9M11 18h9M4 5l1.5-1v5M4 14.5a1.3 1.3 0 012.4.6c0 1-2.4 1.4-2.4 2.9h2.6" /></S>,
  tabela: <S><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M4 11h16M4 15h16M10 5v14" /></S>,
  desfazer: <S><path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" /></S>,
  negrito: <b>B</b>,
  italico: <i>I</i>,
  sobre: <span>x<sup>2</sup></span>,
  sub: <span>x<sub>2</sub></span>,
  aa: <b>Aa</b>,
  expandir: <S><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></S>,
  mais: <S><path d="M12 5h.01M12 12h.01M12 19h.01" strokeWidth="2.4" /></S>,
};
const NOME: Record<string, string> = { titulo: 'Título', marca: 'Marca-texto', topicos: 'Lista com tópicos', numerada: 'Lista numerada', tabela: 'Tabela', desfazer: 'Desfazer', negrito: 'Negrito', italico: 'Itálico', sobre: 'Sobrescrito', sub: 'Subscrito', aa: 'Mais estilos', expandir: 'Ampliar', mais: 'Opções' };

export type Variante = 'balao' | 'soltos' | 'dividido';
export type Aberto = 'ni' | 'ss' | null;
type Par = [string, string];

export function Barra({ variante, aberto: inicial }: { variante: Variante; aberto: Aberto }) {
  const [ligados, setLigados] = useState<string[]>(['negrito']);
  const [aberto, setAberto] = useState<Aberto>(inicial);
  const on = (id: string) => ligados.includes(id);
  const alterna = (id: string) =>
    setLigados((v) => {
      if (v.includes(id)) return v.filter((x) => x !== id);
      const oposto = id === 'sobre' ? 'sub' : id === 'sub' ? 'sobre' : '';
      return [...v.filter((x) => x !== oposto), id];
    });
  const abre = (k: 'ni' | 'ss') => setAberto(aberto === k ? null : k);

  const botao = (id: string, extra = '') => (
    <button type="button" className={`b8-b ${extra}`} aria-pressed={on(id)} aria-label={NOME[id]} title={NOME[id]} onClick={() => alterna(id)}>{IC[id]}</button>
  );
  const balao = (ids: Par) => (
    <span className="b8-balao" role="menu">
      {ids.map((id) => (
        <button key={id} type="button" role="menuitemcheckbox" aria-checked={on(id)} className="b8-b" onClick={() => alterna(id)}>
          {IC[id]}
          <span>{NOME[id]}</span>
        </button>
      ))}
    </span>
  );
  // Duplo: um botão que mostra o estado e abre o balão (um toque a mais).
  const duplo = (k: 'ni' | 'ss', ids: Par) => {
    const ligado = ids.find(on);
    return (
      <span className="b8-duplo">
        <button type="button" className="b8-b" aria-expanded={aberto === k} aria-pressed={!!ligado} aria-label={ids.map((i) => NOME[i]).join(' / ')} onClick={() => abre(k)}>
          {k === 'ni' ? <><b>B</b><i>I</i></> : IC[ligado ?? ids[0]]}
          <em aria-hidden="true" />
        </button>
        {aberto === k && balao(ids)}
      </span>
    );
  };
  // Ciclo: normal → sobrescrito → subscrito → normal, num toque só por vez; o botão mostra o estado atual.
  const ciclo = () => {
    const atual = on('sobre') ? 'sobre' : on('sub') ? 'sub' : 'normal';
    setLigados((v) => {
      const limpo = v.filter((x) => x !== 'sobre' && x !== 'sub');
      return atual === 'normal' ? [...limpo, 'sobre'] : atual === 'sobre' ? [...limpo, 'sub'] : limpo;
    });
  };
  const alternavel = () => {
    const estado = on('sobre') ? 'sobre' : on('sub') ? 'sub' : 'normal';
    return (
      <button type="button" className="b8-b" aria-pressed={estado !== 'normal'} aria-label="Sobrescrito e subscrito (alterna)" title="Sobrescrito, depois subscrito, depois normal" onClick={ciclo}>
        {estado === 'sub' ? IC.sub : IC.sobre}
      </button>
    );
  };
  // Dividido: o botão principal age direto; a seta abre o par.
  const dividido = (k: 'ni' | 'ss', ids: Par) => (
    <span className="b8-duplo b8-div">
      {botao(ids[0], 'b8-prin')}
      <button type="button" className="b8-seta" aria-expanded={aberto === k} aria-label={`Mais: ${NOME[ids[1]]}`} onClick={() => abre(k)}>▾</button>
      {aberto === k && balao(ids)}
    </span>
  );

  return (
    <section className={`${bloco.bloco} b8-janela`} data-foco="dentro" aria-label="Anotações">
      <div className="b8-faixa" role="toolbar" aria-label="Formatação">
        <span className="b8-grupo">{botao('titulo')}</span>
        <span className="b8-grupo">
          {variante === 'balao' && duplo('ni', ['negrito', 'italico'])}
          {variante === 'soltos' && <>{botao('negrito')}{botao('italico')}</>}
          {variante === 'dividido' && dividido('ni', ['negrito', 'italico'])}
          {botao('marca')}
        </span>
        <span className="b8-grupo">{botao('topicos')}{botao('numerada')}</span>
        <span className="b8-grupo">
          {botao('tabela')}
          {variante === 'dividido' ? dividido('ss', ['sobre', 'sub']) : variante === 'soltos' ? alternavel() : duplo('ss', ['sobre', 'sub'])}
        </span>
        <span className="b8-grupo">{botao('desfazer')}</span>
        <span className="b8-grupo">{botao('aa')}</span>
        <span className="b8-fim">{botao('expandir')}{botao('mais')}</span>
      </div>
      <div className={mesa.editor}>
        <div className={mesa.texto}>
          <h2>Tipo I (imediata)</h2>
          <p>O alérgeno liga a <b>IgE</b> presa ao mastócito e provoca a degranulação. A concentração de Ca<sup>2+</sup> sobe dentro da célula.</p>
          <ul><li>Fase imediata: minutos.</li><li>Fase tardia: 6 a 24 horas.</li></ul>
        </div>
      </div>
    </section>
  );
}

export function Pagina({ variante }: { variante: Variante }) {
  const amostras: [string, Aberto][] = [
    ['Em repouso', null],
    ['Balão de negrito e itálico aberto', 'ni'],
    ['Balão de sobrescrito e subscrito aberto (não existe na V2)', 'ss'],
  ];
  return (
    <div className="b8-pagina">
      {amostras.map(([titulo, aberto]) => (
        <div key={titulo} className="b8-amostra">
          <h3>{titulo}</h3>
          <Barra variante={variante} aberto={aberto} />
        </div>
      ))}
    </div>
  );
}
