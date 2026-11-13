// Mesa com Slides sobre Cartões (metade esquerda) e Anotações (direita); o bloco de Cartões
// mostra o EDITOR novo: escreve-se dentro do cartão, já com o visual final. A marca (@, #, ##)
// só aparece, em pílula, na linha do cursor. Clique numa linha para levar o cursor de mentira.
// Query: &cor=on liga a cor nos títulos; &foco=cartoes marca o bloco de cartões.
import { useEffect, useState } from 'react';
import { Dialog, Menu, MenuItem, Modal, ModalOverlay } from 'react-aria-components';
import { Button } from '../../../src/ui/components/Button';
import { Block, Nota, Passador, Slide, Tela, Topo, AbasCartoes, fixo } from '../mesa/_partes';
import opcoes from '../../../src/ui/shell/OptionsWindow.module.css';
import './cartao.css';

const pedido = new URLSearchParams(location.search);
document.documentElement.dataset.corTitulos = pedido.get('cor') === 'on' ? 'on' : 'off';

type Tipo = 'frente' | 'secao' | 'sub' | 'item' | 'numero' | 'seta' | 'pro' | 'con' | 'duvida' | 'texto';
interface Linha {
  tipo: Tipo;
  marca: string;
  texto: string;
}

const MARCAS: readonly [Tipo, RegExp][] = [
  ['frente', /^@\s?/],
  ['sub', /^##\s?/],
  ['secao', /^#\s?/],
  ['con', /^--\s/],
  ['pro', /^\+\s/],
  ['duvida', /^\?\s?/],
  ['seta', /^->\s?/],
  ['item', /^-\s/],
  ['numero', /^\d+[.)]\s/],
];
const SIMBOLO: Partial<Record<Tipo, string>> = { item: '•', seta: '→', pro: '+', con: '−', duvida: '?' };

function ler(cru: string): Linha {
  for (const [tipo, marca] of MARCAS) {
    const achou = marca.exec(cru);
    if (achou) return { tipo, marca: achou[0].trim(), texto: cru.slice(achou[0].length) };
  }
  return { tipo: 'texto', marca: '', texto: cru };
}

// Texto digitado (com os marcadores que o usuário escreveria).
const CARTOES = [
  `@Sinal de Blumberg
#Execução
1. Paciente em decúbito dorsal
2. Compressão lenta e profunda no ponto de McBurney
#Achado
Dor aguda no momento exato da descompressão.
##`,
  `@Testes de Weber e Rinne
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
Rinne -> determina o tipo de perda auditiva`,
].map((t) => t.split('\n').map(ler));

interface Grupo {
  titulo?: number;
  linhas: number[];
  subs: { titulo: number; linhas: number[] }[];
}

// "##" abre um sub-bloco que guarda as linhas seguintes até o próximo "#" ou "##".
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

const html = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>')
    .replace(/__([^_]+)__/g, '<u>$1</u>')
    .replace(/==([^=]+)==/g, '<mark>$1</mark>')
    .replace(/\^([^^]+)\^/g, '<sup>$1</sup>')
    .replace(/~([^~]+)~/g, '<sub>$1</sub>')
    .replace(/-&gt;/g, '→');

function CartaoEditor({ linhas, c, cursor, mover }: {
  linhas: Linha[];
  c: number;
  cursor: { cartao: number; linha: number };
  mover: (cartao: number, linha: number) => void;
}) {
  const linha = (l: number) => {
    const { tipo, marca, texto } = linhas[l]!;
    const aqui = cursor.cartao === c && cursor.linha === l;
    const lista = tipo === 'numero' || SIMBOLO[tipo] !== undefined;
    const corpo = (
      <>
        <span dangerouslySetInnerHTML={{ __html: html(texto) }} />
        {aqui && <i className="fc-cursor" />}
      </>
    );
    return (
      <div key={l} className="fc-linha" data-tipo={tipo} onClick={() => mover(c, l)}>
        {lista ? (
          <div className={`fc-h${tipo === 'numero' ? ' n' : ''}`}>
            <span>{tipo === 'numero' ? marca : SIMBOLO[tipo]}</span>
            <span>{corpo}</span>
          </div>
        ) : (
          <>
            {aqui && (tipo === 'frente' || tipo === 'secao' || tipo === 'sub') && <span className="fc-marca">{marca}</span>}
            {corpo}
          </>
        )}
      </div>
    );
  };
  return (
    <article className="fc-card" data-ativo={cursor.cartao === c}>
      {linhas[0]?.tipo === 'frente' && <div className="fc-frente">{linha(0)}</div>}
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

type Densidade = 'padrao' | 'compacta';

function Editor({ densidade }: { densidade: Densidade }) {
  const [cursor, setCursor] = useState({ cartao: 0, linha: CARTOES[0]!.length - 1 });
  return (
    <div className="fc-editor">
      <div className={`fc-lista fc-${densidade}`}>
        {CARTOES.map((linhas, c) => (
          <CartaoEditor key={c} linhas={linhas} c={c} cursor={cursor} mover={(cartao, linha) => setCursor({ cartao, linha })} />
        ))}
      </div>
      <footer className="fc-rodape">
        <Button variant="primary" shortcut="Ctrl Enter">
          Salvar 1
        </Button>
      </footer>
    </div>
  );
}

// O menu ⋮ do bloco é a janela de opções do app (OptionsWindow): aqui as duas escolhas de aparência
// entram como itens, no mesmo padrão do "Ocultar barra de formatação" das Anotações (o rótulo troca).
export function MesaFlashcard() {
  const [densidade, setDensidade] = useState<Densidade>(pedido.get('dens') === 'compacta' ? 'compacta' : 'padrao');
  const [cor, setCor] = useState(document.documentElement.dataset.corTitulos === 'on');
  const [aberto, setAberto] = useState(pedido.get('menu') === 'cartoes');
  const compacto = densidade === 'compacta';

  useEffect(() => {
    const abrir = (e: MouseEvent) => {
      if ((e.target as Element).closest('button[aria-label="Opções de Cartões"]')) setAberto(true);
    };
    document.addEventListener('click', abrir, true);
    return () => document.removeEventListener('click', abrir, true);
  }, []);

  const itens = [
    { id: 'compacto', label: compacto ? 'Usar cartão padrão' : 'Usar cartão compacto' },
    { id: 'cor', label: cor ? 'Desligar cor nos títulos' : 'Ligar cor nos títulos' },
    { id: 'salvos', label: 'Ver cartões salvos' },
  ];
  const rodar = (id: React.Key) => {
    setAberto(false);
    if (id === 'compacto') setDensidade(compacto ? 'padrao' : 'compacta');
    if (id === 'cor') {
      document.documentElement.dataset.corTitulos = cor ? 'off' : 'on';
      setCor(!cor);
    }
  };

  return (
    <div className="fc-escopo">
      <Tela topo={<Topo alternadores="icones" fim="icones" />}>
        <Block id="slides" title="Slides" icon="slides" tools={<Passador />} shortcut="Alt S" menu fixed={fixo('slides')}>
          <Slide />
        </Block>
        <Block id="notas" title="Anotações" icon="notas" shortcut="Alt A" menu fixed={fixo('notas')}>
          <Nota />
        </Block>
        <Block id="cartoes" title="Cartões" icon="cartoes" tools={<AbasCartoes />} shortcut="Alt C" menu fixed={fixo('cartoes')}>
          <Editor densidade={densidade} />
        </Block>
      </Tela>
      <ModalOverlay className={opcoes.veu} isOpen={aberto} isDismissable onOpenChange={setAberto}>
        <Modal className={opcoes.caixa}>
          <Dialog aria-label="Opções do bloco" className={opcoes.janela}>
            <Menu autoFocus="first" aria-label="Opções" items={itens} onAction={rodar} className={opcoes.lista}>
              {(item) => (
                <MenuItem className={opcoes.item} textValue={item.label}>
                  <span>{item.label}</span>
                </MenuItem>
              )}
            </Menu>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
