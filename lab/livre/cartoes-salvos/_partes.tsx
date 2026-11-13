// Aba "Salvos" do bloco de Cartões como lista de fato (backlog 13/11), no lugar da grade colorida.
// Três modelos: 'linhas' (uma linha por cartão), 'duas' (pergunta + começo do verso) e
// 'lado' (lista à esquerda, cartão do cursor à direita). O cartão aberto é o da D138.
// Só desenho: ↑ ↓ movem o cursor, Enter abre e fecha, Esc fecha (teclas só da bancada).
// Query: &foco=cartoes acende o bloco · &cursor=3 · &aberto=1 · &vazio=1
import { useEffect, useRef, useState } from 'react';
import { Block } from '../../../src/ui/components/Block';
import { BlockTab, BlockTabs } from '../../../src/ui/components/Toggles';
import { Nota, Passador, Slide, Tela, Topo, fixo } from '../mesa/_partes';
import { agrupar, html, ler, type Linha } from '../mesa-flashcard/_partes';
import '../mesa-flashcard/cartao.css';
import './lista.css';

const pedido = new URLSearchParams(location.search);
const VAZIO = pedido.get('vazio') === '1';

// Caso extremo: 12 cartões, pergunta comprida (3), verso com seções (1 e 5), verso de uma palavra (6).
const TEXTOS = [
  `@Quem medeia a hipersensibilidade tipo I?
#Células
- Mastócitos
- Basófilos
#Anticorpo
IgE presa ao mastócito pelo ==FcεRI==`,
  `@Exemplos de hipersensibilidade tipo II
- Miastenia gravis
- Anemia hemolítica autoimune
- Doença de Graves`,
  `@Em quais tecidos os imunocomplexos da hipersensibilidade tipo III costumam se depositar, e por que justamente neles?
#Onde
Vaso, rim e articulação
#Por quê
Filtração sob pressão alta e fluxo turbulento.`,
  `@Tempo da reação tipo IV
48 a 72 horas`,
  `@Testes de Weber e Rinne
#Conceito
Avaliam a acuidade auditiva e ajudam a diferenciar perda condutiva de sensorioneural.
#Weber
##Execução
Diapasão vibrando no topo da cabeça.
##Achados
- Perda condutiva -> lateraliza para o lado afetado.
- Perda sensorioneural -> lateraliza para o lado saudável.`,
  `@Mediador da fase imediata
Histamina`,
  `@O que o PPD testa?
Hipersensibilidade tardia (linfócitos T)`,
  `@Fase tardia da tipo I
#Quando
6 a 24 horas
#Quem
Eosinófilos e leucotrienos`,
  `@Sinal de Blumberg
#Execução
1. Paciente em decúbito dorsal
2. Compressão lenta e profunda no ponto de McBurney
3. Retirada brusca da mão
#Achado
Dor aguda no momento exato da descompressão.`,
  `@Anticorpo da doença de Graves
Anti-receptor de TSH (estimula)`,
  `@Dermatite de contato: qual tipo?
Tipo IV (linfócitos T)`,
  `@Doença do soro
Tipo III: imunocomplexos circulantes`,
];
const CARTOES = (VAZIO ? [] : TEXTOS).map((t) => t.split('\n').map(ler));

const frente = (linhas: Linha[]) => linhas[0]?.texto ?? '';
// Começo do verso em uma linha: as linhas de texto, sem os títulos de seção.
const comeco = (linhas: Linha[]) =>
  linhas
    .slice(1)
    .filter((l) => l.tipo !== 'secao' && l.tipo !== 'sub' && l.texto)
    .map((l) => l.texto)
    .join(' · ');

const Texto = ({ children }: { children: string }) => (
  <span dangerouslySetInnerHTML={{ __html: html(children) }} />
);

// O cartão salvo, só leitura, com o visual da D138 (compacto).
function Cartao({ linhas, cursor }: { linhas: Linha[]; cursor?: boolean }) {
  const linha = (l: number) => {
    const { tipo, marca, texto } = linhas[l]!;
    const sinal =
      tipo === 'numero'
        ? marca
        : { item: '•', seta: '→', pro: '+', con: '−', duvida: '?' }[tipo as string];
    return (
      <div key={l} className="fc-linha">
        {sinal ? (
          <div className={`fc-h${tipo === 'numero' ? ' n' : ''}`}>
            <span>{sinal}</span>
            <Texto>{texto}</Texto>
          </div>
        ) : (
          <Texto>{texto}</Texto>
        )}
      </div>
    );
  };
  return (
    <article className="fc-card cs-cartao" data-ativo={cursor}>
      <div className="fc-frente">{linha(0)}</div>
      <div className="fc-verso">
        {agrupar(linhas).map((g, i) => (
          <section key={i}>
            {g.titulo !== undefined && <h3>{linha(g.titulo)}</h3>}
            {g.linhas.map(linha)}
            {g.subs.map((s) => (
              <div key={s.titulo} className="fc-sub">
                <div className="fc-st">{linha(s.titulo)}</div>
                {s.linhas.map(linha)}
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}

export type Modelo = 'linhas' | 'duas' | 'lado';

function Lista({ modelo }: { modelo: Modelo }) {
  const aceso = fixo('cartoes') !== 'none';
  const [cursor, setCursor] = useState(Number(pedido.get('cursor') ?? 1));
  const [aberto, setAberto] = useState(pedido.get('aberto') === '1');
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') setCursor((c) => Math.min(c + 1, CARTOES.length - 1));
      else if (e.code === 'ArrowUp') setCursor((c) => Math.max(c - 1, 0));
      else if (e.code === 'Enter') setAberto((a) => !a);
      else if (e.code === 'Escape') setAberto(false);
      else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, []);
  useEffect(() => {
    raiz.current?.querySelector('[data-aqui="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor, aberto]);

  if (CARTOES.length === 0) return <p className="cs-vazio">Sem cartões nesta aula. Alt N cria.</p>;

  const itens = (abreNaLinha: boolean) => (
    <ol className="cs-lista" data-modelo={modelo}>
      {CARTOES.map((linhas, i) => {
        const aqui = i === cursor;
        if (abreNaLinha && aqui && aberto)
          return (
            <li key={i} data-aqui="true" onClick={() => setAberto(false)}>
              <Cartao linhas={linhas} cursor={aceso} />
            </li>
          );
        return (
          <li key={i} data-aqui={aqui}>
            <button
              type="button"
              className="cs-linha"
              data-cursor={aqui && aceso ? '' : undefined}
              data-sel={aqui}
              onClick={() => {
                setAberto(abreNaLinha && !(aqui && aberto));
                setCursor(i);
              }}
            >
              <span className="cs-n">{i + 1}</span>
              <span className="cs-texto">
                <span className="cs-p">
                  <Texto>{frente(linhas)}</Texto>
                </span>
                {modelo === 'duas' && (
                  <span className="cs-r">
                    <Texto>{comeco(linhas)}</Texto>
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  if (modelo !== 'lado')
    return (
      <div className="cs-raiz fc-compacta" ref={raiz}>
        {itens(true)}
      </div>
    );
  // Lado a lado: o cartão acompanha o cursor. No bloco estreito some a coluna e Enter abre na linha.
  return (
    <div className="cs-raiz cs-lado fc-compacta" ref={raiz}>
      <div className="cs-col cs-so-largo">{itens(false)}</div>
      <div className="cs-col cs-so-largo cs-previa">
        <Cartao linhas={CARTOES[cursor]!} />
      </div>
      <div className="cs-col cs-so-estreito">{itens(true)}</div>
    </div>
  );
}

export function MesaSalvos({ modelo }: { modelo: Modelo }) {
  const abas = (
    <BlockTabs label="Cartões">
      <BlockTab selected={false} onPress={() => {}}>
        Novo
      </BlockTab>
      <BlockTab selected count={CARTOES.length} onPress={() => {}}>
        Salvos
      </BlockTab>
    </BlockTabs>
  );
  return (
    <div className="fc-escopo">
      <Tela topo={<Topo alternadores="icones" fim="menu" />}>
        <Block
          id="slides"
          title="Slides"
          icon="slides"
          tools={<Passador />}
          shortcut="Alt S"
          menu
          fixed={fixo('slides')}
        >
          <Slide />
        </Block>
        <Block
          id="notas"
          title="Anotações"
          icon="notas"
          shortcut="Alt A"
          menu
          fixed={fixo('notas')}
        >
          <Nota />
        </Block>
        <Block
          id="cartoes"
          title="Cartões"
          icon="cartoes"
          tools={abas}
          shortcut="Alt C"
          menu
          fixed={fixo('cartoes')}
        >
          <Lista modelo={modelo} />
        </Block>
      </Tela>
    </div>
  );
}
