// Bancada criador-mosaico: só o bloco de criação. A pergunta é como o cartão aparece enquanto se
// escreve: texto puro (V1), já pronto (V2) ou texto com a prévia ao lado (V3).
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { clozeNumbers, expandCloze, hasCloze } from '../../../src/core/study/cloze';
import { Block } from '../../../src/ui/components/Block';
import { Button } from '../../../src/ui/components/Button';
import { CardBack, ClozeCard, Inline, StudyCard } from '../../../src/ui/components/CardBack';
import { ImageIcon } from '../../../src/ui/components/CardImages';
import { Key } from '../../../src/ui/components/Key';
import { BlockTab, BlockTabs } from '../../../src/ui/components/Toggles';
import cb from '../../../src/ui/components/CardBack.module.css';
import './cm.css';

const CASOS: Record<string, string> = {
  simples:
    'Quais são as três vias de ativação do complemento e o que dispara cada uma?\n# Vias\n- Clássica: anticorpo (IgM, IgG) no antígeno\n- Lectina: MBL na manose do patógeno\n- Alternativa: C3 espontâneo na superfície\n# Em comum\nTodas chegam à **C3 convertase**.',
  cloze: 'A via {{c1::clássica}} começa com {{c2::C1q}} ligado a IgM ou IgG.',
  vazio: '',
};

type Lado = 'frente' | 'verso';
const pedido = new URLSearchParams(location.search);
const sozinha = pedido.get('v') !== 'todas';

export function useCriador() {
  const [caso, setCaso] = useState(pedido.get('caso') ?? 'simples');
  const [texto, setTexto] = useState(CASOS[caso] ?? '');
  const [lado, setLado] = useState<Lado | null>(sozinha ? 'frente' : null);
  const [aviso, setAviso] = useState('');
  // O campo onde a lacuna entra: a frente (V2) ou o texto inteiro (V1 e V3).
  const campo = useRef<HTMLTextAreaElement>(null);

  const quebra = texto.indexOf('\n');
  const rasc = {
    frente: quebra < 0 ? texto : texto.slice(0, quebra),
    verso: quebra < 0 ? '' : texto.slice(quebra + 1),
  };
  const setRasc = (r: { frente: string; verso: string }) => setTexto(`${r.frente}\n${r.verso}`);
  const cloze = hasCloze(rasc.frente);
  const quantos = cloze ? clozeNumbers(rasc.frente).length : 1;
  const pronto = rasc.frente.trim() !== '' && (cloze || rasc.verso.trim() !== '');

  const trocarCaso = (novo: string) => {
    setCaso(novo);
    setTexto(CASOS[novo] ?? '');
    setAviso('');
    setLado('frente');
    campo.current?.focus();
  };

  const salvar = () => {
    if (!pronto) return;
    setAviso(`${quantos} ${quantos === 1 ? 'cartão salvo' : 'cartões salvos'}`);
    setTexto('');
    setLado('frente');
  };

  // Lacuna nova: envolve a seleção com o próximo número (como o Ctrl Shift C do app).
  const lacuna = () => {
    const area = campo.current;
    if (!area) return;
    const valor = area.value;
    const [inicio, fim] = [area.selectionStart, area.selectionEnd];
    const abre = `{{c${Math.max(0, ...clozeNumbers(texto)) + 1}::`;
    const novo = `${valor.slice(0, inicio)}${abre}${valor.slice(inicio, fim)}}}${valor.slice(fim)}`;
    setTexto(valor === texto ? novo : `${novo}\n${rasc.verso}`);
    const cursor = fim === inicio ? inicio + abre.length : fim + abre.length + 2;
    requestAnimationFrame(() => area.setSelectionRange(cursor, cursor));
  };

  const teclas = (evento: React.KeyboardEvent) => {
    if (evento.ctrlKey && evento.code === 'Enter') salvar();
    else if (evento.ctrlKey && evento.shiftKey && evento.code === 'KeyC') lacuna();
    else return false;
    evento.preventDefault();
    return true;
  };

  return {
    caso,
    trocarCaso,
    texto,
    setTexto,
    rasc,
    setRasc,
    lado,
    setLado,
    aviso,
    campo,
    cloze,
    quantos,
    pronto,
    salvar,
    lacuna,
    teclas,
  };
}

export type Criador = ReturnType<typeof useCriador>;

function crescer(area: HTMLTextAreaElement | null): void {
  if (!area) return;
  area.style.height = 'auto';
  area.style.height = `${area.scrollHeight}px`;
}

// Texto puro: um campo só. A primeira linha é a pergunta; o resto é o verso.
export function Texto({ c, cheio }: { c: Criador; cheio?: boolean }) {
  useLayoutEffect(() => {
    if (!cheio) crescer(c.campo.current);
  });
  useEffect(() => {
    if (sozinha) c.campo.current?.focus();
  }, [c.campo]);
  return (
    <textarea
      ref={c.campo}
      rows={3}
      className="cm-texto"
      data-cheio={cheio ? '' : undefined}
      value={c.texto}
      placeholder={'Pergunta na primeira linha\nResposta nas linhas de baixo'}
      aria-label="Cartão novo"
      spellCheck={false}
      onChange={(e) => c.setTexto(e.target.value)}
      onKeyDown={c.teclas}
    />
  );
}

// Lacuna em pílula com o número no fim (formas G5 e H2 vindas do Claude Web).
function Pilulas({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\{\{c\d+::.+?\}\})/).map((parte, i) => {
        const achou = /^\{\{c(\d+)::(.+?)\}\}$/.exec(parte);
        if (!achou) return parte;
        return (
          <span key={i} className="cm-lac">
            {achou[2]}
            <b>{achou[1]}</b>
          </span>
        );
      })}
    </>
  );
}

export function Campo({ c, qual, dica, pilulas }: { c: Criador; qual: Lado; dica: string; pilulas?: boolean }) {
  const ativo = c.lado === qual;
  const valor = c.rasc[qual];
  const proprio = useRef<HTMLTextAreaElement>(null);
  const area = qual === 'frente' ? c.campo : proprio;
  useLayoutEffect(() => crescer(area.current));
  useEffect(() => {
    if (ativo) area.current?.focus();
  }, [ativo, area]);

  if (ativo) {
    return (
      <div className="cm-ativa">
        <textarea
          ref={area}
          rows={1}
          className="cm-campo"
          value={valor}
          placeholder={dica}
          aria-label={dica}
          spellCheck={false}
          onChange={(e) => c.setRasc({ ...c.rasc, [qual]: e.target.value })}
          onBlur={() => c.setLado((l) => (l === qual ? null : l))}
        />
      </div>
    );
  }
  const pronto =
    qual === 'frente' ? (
      <p>
        {valor ? pilulas ? <Pilulas text={valor} /> : <Inline text={valor} cloze="revela" /> : <span className="cm-dica">{dica}</span>}
      </p>
    ) : valor ? (
      <CardBack back={valor} />
    ) : (
      <p className="cm-dica">{dica}</p>
    );
  return (
    <div className="cm-parado" tabIndex={0} onFocus={() => c.setLado(qual)}>
      {pronto}
    </div>
  );
}

// Cartão pronto: a peça do cartão é o editor; só o lado com o cursor vira texto.
export function Escrita({ c }: { c: Criador }) {
  const teclas = (evento: React.KeyboardEvent) => {
    if (c.teclas(evento)) return;
    if (evento.code === 'Enter' && !evento.shiftKey && c.lado === 'frente') {
      c.setLado('verso');
      evento.preventDefault();
    } else if (evento.code === 'Escape') c.setLado(null);
  };
  return (
    <article className={`${cb.carta} cm-carta`} onKeyDown={teclas}>
      <div className={`${cb.frente} cm-frente`}>
        <Campo c={c} qual="frente" dica="Pergunta, ou frase com lacuna" />
      </div>
      <div className={`${cb.verso} cm-verso`}>
        <Campo c={c} qual="verso" dica={c.cloze ? 'Extra (opcional)' : 'Resposta'} />
      </div>
    </article>
  );
}

// Prévia: a mesma peça que o Treino e os Salvos mostram.
export function Previa({ c }: { c: Criador }) {
  if (c.rasc.frente.trim() === '')
    return <p className="cm-sem">A prévia aparece quando você escreve.</p>;
  if (!c.cloze) return <StudyCard front={c.rasc.frente} back={c.rasc.verso} />;
  return (
    <div className="cm-pares">
      {expandCloze(c.rasc.frente).map((frase, i) => (
        <ClozeCard key={i} text={frase} />
      ))}
    </div>
  );
}

export function Rotulo({ children }: { children: ReactNode }) {
  return <h3 className="cm-rotulo">{children}</h3>;
}

const segura = { onMouseDown: (e: React.MouseEvent) => e.preventDefault() };

// Ações para o dedo: as mesmas do teclado. O tipo do cartão é lido do texto.
export function Acoes({ c }: { c: Criador }) {
  return (
    <div className="cm-acoes" {...segura}>
      <Button variant="quiet" shortcut="Ctrl ⇧ C" onPress={c.lacuna}>
        Lacuna
      </Button>
      <Button variant="quiet" label="Anexar imagem">
        <span className="cm-icone">
          <ImageIcon plus />
        </span>
        Imagem
      </Button>
      <span className="cm-tipo">
        {c.aviso !== '' && c.texto === '' ? c.aviso : c.cloze ? 'Cloze' : 'Simples'}
      </span>
    </div>
  );
}

interface QuadroProps {
  c: Criador;
  nota: string;
  caminho: readonly (readonly [string, string])[];
  children: ReactNode;
}

// O bloco Cartões sozinho, com a frase de prós e contras, a troca de exemplo e as teclas.
export function Quadro({ c, nota, caminho, children }: QuadroProps) {
  const tools = (
    <>
      <BlockTabs label="Cartões">
        <BlockTab selected onPress={() => undefined}>
          Novo
        </BlockTab>
        <BlockTab selected={false} count={4} onPress={() => undefined}>
          Salvos
        </BlockTab>
      </BlockTabs>
      <span {...segura}>
        <Button variant="primary" disabled={!c.pronto} onPress={c.salvar}>
          {c.pronto && c.quantos > 1 ? `Salvar ${c.quantos}` : 'Salvar'}
        </Button>
      </span>
    </>
  );
  return (
    <div className="cm-palco">
      <p className="cm-nota">{nota}</p>
      <span className="cm-casos">
        {(['simples', 'cloze', 'vazio'] as const).map((caso) => (
          <button
            key={caso}
            type="button"
            aria-pressed={c.caso === caso}
            onClick={() => c.trocarCaso(caso)}
          >
            {caso}
          </button>
        ))}
      </span>
      <Block
        id="cm-cartoes"
        title="Cartões"
        icon="cartoes"
        fixed="inside"
        menu
        tools={tools}
        className="cm-bloco"
      >
        <div className="cm-corpo">{children}</div>
      </Block>
      <p className="cm-caminho">
        {caminho.map(([tecla, faz]) => (
          <span key={tecla}>
            <Key>{tecla}</Key> {faz}
          </span>
        ))}
      </p>
    </div>
  );
}
