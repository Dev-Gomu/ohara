// Bancada dos cartões da Mesa: escreve-se dentro do cartão, já com o visual final.
// Cartão de uma peça: a frente ocupa o topo e o verso vem logo abaixo, no mesmo contorno.
// "#" abre uma seção; "##" abre um sub-bloco dentro dela, que guarda as linhas seguintes.
import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { Button } from '../../../src/ui/components/Button';
import './cartoes.css';

type Tipo = 'frente' | 'secao' | 'sub' | 'numero' | 'item' | 'texto';
interface Linha {
  tipo: Tipo;
  marca: string;
  texto: string;
}

const MARCAS: readonly [Tipo, RegExp][] = [
  ['frente', /^@\s?/],
  ['sub', /^##\s?/],
  ['secao', /^#\s?/],
  ['item', /^-\s/],
  ['numero', /^\d+[.)]\s/],
];

function ler(cru: string): Linha {
  for (const [tipo, marca] of MARCAS) {
    const achou = marca.exec(cru);
    if (achou) return { tipo, marca: achou[0].trim(), texto: cru.slice(achou[0].length) };
  }
  return { tipo: 'texto', marca: '', texto: cru };
}

const CARTOES = [
  `@Testes de Weber e Rinne
#Conceito
Avaliam a acuidade auditiva e ajudam a diferenciar perda condutiva de sensorioneural.
#Weber
##Execução
Diapasão vibrando no topo da cabeça.
##Achados
**Normal**
→ Som percebido igualmente nos dois lados.
**Alteração**
→ Lateralização do som.
- Perda condutiva → lateraliza para o lado afetado.
- Perda sensorioneural → lateraliza para o lado saudável.
#Realizados em conjunto
Weber → identifica para qual lado o som lateraliza
Rinne → determina o tipo de perda auditiva`,
  `@Sinal de Blumberg
#Execução
1. Paciente em decúbito dorsal
2. Compressão lenta e profunda no ponto de McBurney
#Achado
Dor aguda no momento exato da descompressão.
##`,
].map((texto) => texto.split('\n').map(ler));

interface Grupo {
  titulo?: number;
  linhas: number[];
  subs: { titulo: number; linhas: number[] }[];
}

function agrupar(linhas: Linha[]): Grupo[] {
  const grupos: Grupo[] = [];
  linhas.forEach((linha, i) => {
    if (linha.tipo === 'frente') return;
    if (linha.tipo === 'secao' || grupos.length === 0) grupos.push({ linhas: [], subs: [] });
    const grupo = grupos[grupos.length - 1]!;
    if (linha.tipo === 'secao') grupo.titulo = i;
    else if (linha.tipo === 'sub') grupo.subs.push({ titulo: i, linhas: [] });
    else (grupo.subs.at(-1)?.linhas ?? grupo.linhas).push(i);
  });
  return grupos;
}

function negrito(texto: string): ReactNode {
  const achou = /^\*\*(.+)\*\*$/.exec(texto);
  return achou ? <strong>{achou[1]}</strong> : texto;
}

export type Sub = 'azul' | 'legenda' | 'cabecalho' | 'trilho';

// Recuo curto do sub-bloco: um botão só, que vale para todas as versões abertas.
const ouvintes = new Set<() => void>();
const raiz = document.documentElement;
raiz.dataset.mcRecuo ??= 'sim';
const lerRecuo = () => raiz.dataset.mcRecuo === 'sim';
const assinar = (aviso: () => void) => {
  ouvintes.add(aviso);
  return () => ouvintes.delete(aviso);
};
function trocarRecuo() {
  raiz.dataset.mcRecuo = lerRecuo() ? 'nao' : 'sim';
  ouvintes.forEach((aviso) => aviso());
}

interface Opcoes {
  sub: Sub;
  nota: string;
}

export function Bancada({ sub, nota }: Opcoes) {
  // Cursor de mentira: clique numa linha para levar o cursor até ela.
  const [cursor, setCursor] = useState({ cartao: 1, linha: 6 });
  const recuo = useSyncExternalStore(assinar, lerRecuo);

  const desenhar = (linhas: Linha[], c: number) => {
    const linha = (l: number) => {
      const { tipo, marca, texto } = linhas[l]!;
      const aqui = cursor.cartao === c && cursor.linha === l;
      const codigo = tipo === 'frente' || tipo === 'secao' || tipo === 'sub';
      return (
        <div
          key={l}
          className="mc-linha"
          data-tipo={tipo}
          onClick={() => setCursor({ cartao: c, linha: l })}
        >
          {codigo && aqui && <span className="mc-marca">{marca}</span>}
          <span className="mc-texto">
            {tipo === 'numero' && <b className="mc-num">{marca} </b>}
            {tipo === 'item' && <b className="mc-num">• </b>}
            {negrito(texto)}
            {aqui && <i className="mc-cursor" />}
          </span>
        </div>
      );
    };
    return (
      <article
        key={c}
        className="mc-cartao"
        data-recuos={false}
        data-sub={sub}
        data-ativo={cursor.cartao === c}
      >
        {linhas[0]?.tipo === 'frente' && linha(0)}
        <div className="mc-verso">
          {agrupar(linhas).map((grupo, g) => (
            <section key={g} className="mc-secao">
              {grupo.titulo !== undefined && linha(grupo.titulo)}
              {grupo.linhas.map(linha)}
              {grupo.subs.map((sub) => (
                <div key={sub.titulo} className="mc-sub">
                  {linha(sub.titulo)}
                  {sub.linhas.map(linha)}
                </div>
              ))}
            </section>
          ))}
        </div>
      </article>
    );
  };

  return (
    <div className="mc-bloco">
      <header className="mc-topo">
        <h3>Cartões</h3>
        <span className="mc-abas">
          <button className="mc-recuo" aria-pressed={recuo} onClick={trocarRecuo}>
            Recuo
          </button>
          <span data-escolhida="true">Novo</span>
          <span>Salvos 12</span>
        </span>
      </header>
      <div className="mc-lista">{CARTOES.map(desenhar)}</div>
      <footer className="mc-rodape">
        <p>{nota}</p>
        <Button variant="primary" shortcut="Ctrl Enter">
          Salvar 1
        </Button>
      </footer>
    </div>
  );
}
