// Itens 1 a 3. As teclas aqui são simuladas por onKeyDown local só na bancada; no app viram linhas
// da tabela de teclas lidas pelo listener único (ver LEIA-ME).
import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Button } from '../../../src/ui/components/Button';
import { Key } from '../../../src/ui/components/Key';
import { BlockTab, ToggleGroup } from '../../../src/ui/components/Toggles';

const LISTAS = ['Só Mesa', 'Universais', 'Todos'] as const;
const LINHAS: Record<number, [string, string][]> = {
  0: [
    ['Amplia o bloco', 'Alt M'],
    ['Vai ao campo', 'Alt F'],
    ['Abre ou fecha Anotações', 'Alt A'],
  ],
  1: [
    ['Paleta: ir para…', 'Alt P'],
    ['Desfaz a última exclusão', 'Alt Z'],
    ['Ajuda', 'Alt /'],
  ],
  2: [
    ['Mesa', 'Alt 2'],
    ['Foco para direita', 'Alt L'],
    ['Troca o tema', 'Alt D'],
    ['Negrito', 'Ctrl B'],
  ],
};

function Ajuda({ nova }: { nova: boolean }) {
  const [aba, setAba] = useState(0);
  const [aberta, setAberta] = useState(true);
  const [ultima, setUltima] = useState('—');
  const tecla = (e: KeyboardEvent) => {
    if (!aberta) return;
    if (e.code === 'Escape') {
      e.preventDefault();
      if (nova && aba !== 0) {
        setAba(0);
        setUltima('Esc: voltou para "Só Mesa"');
      } else {
        setAberta(false);
        setUltima('Esc: fechou a Ajuda');
      }
    }
    if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
      e.preventDefault();
      if (!nova) {
        setUltima(`${e.code === 'ArrowRight' ? '→' : '←'}: nada acontece`);
        return;
      }
      const passo = e.code === 'ArrowRight' ? 1 : -1;
      setAba((a) => (a + passo + LISTAS.length) % LISTAS.length);
      setUltima(`${passo > 0 ? '→' : '←'}: trocou de lista`);
    }
  };
  return (
    <div className="qv-lado" tabIndex={0} onKeyDown={tecla}>
      <span className="qv-rotulo">{nova ? 'Proposta' : 'Hoje'}</span>
      {aberta ? (
        <>
          <ToggleGroup label="Listas de atalhos">
            {LISTAS.map((nome, i) => (
              <BlockTab
                key={nome}
                selected={aba === i}
                count={LINHAS[i]?.length ?? 0}
                onPress={() => setAba(i)}
              >
                {nome}
              </BlockTab>
            ))}
          </ToggleGroup>
          <ul className="qv-ajuda-lista">
            {(LINHAS[aba] ?? []).map(([texto, k]) => (
              <li key={texto}>
                <span>{texto}</span>
                <Key>{k}</Key>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="qv-fechada">
          Ajuda fechada.{' '}
          <Button
            variant="quiet"
            onPress={() => {
              setAberta(true);
              setAba(0);
            }}
          >
            Abrir de novo
          </Button>
        </div>
      )}
      <p className="qv-dica">
        Clique aqui e use ← → e Esc. Última tecla: <b>{ultima}</b>
      </p>
    </div>
  );
}

export function SecaoAjuda() {
  return (
    <section className="qv-secao">
      <h2>1. Ajuda: trocar de lista pelo teclado</h2>
      <p>
        Hoje a janela recebe ← → crus e não faz nada com eles; Esc fecha tudo de uma vez. Proposta:
        ← → trocam a lista, e o Esc em dois passos (primeiro volta para "Só a tela", depois fecha).
        Ao reabrir, começa sempre em "Só a tela".
      </p>
      <div className="qv-par">
        <Ajuda nova={false} />
        <Ajuda nova />
      </div>
    </section>
  );
}

type Grade = { linhas: number; colunas: number; l: number; c: number };

function Tabela({ nova }: { nova: boolean }) {
  const [g, setG] = useState<Grade>({ linhas: 3, colunas: 3, l: 1, c: 1 });
  const [ultima, setUltima] = useState('—');
  const faz = (nome: string, f: (x: Grade) => Grade) => {
    setG((x) => f(x));
    setUltima(nome);
  };
  const cmd = {
    linhaAbaixo: () => faz('+ Linha abaixo', (x) => ({ ...x, linhas: x.linhas + 1, l: x.l + 1 })),
    linhaAcima: () => faz('+ Linha acima', (x) => ({ ...x, linhas: x.linhas + 1 })),
    colunaDireita: () =>
      faz('+ Coluna à direita', (x) => ({ ...x, colunas: x.colunas + 1, c: x.c + 1 })),
    colunaEsquerda: () => faz('+ Coluna à esquerda', (x) => ({ ...x, colunas: x.colunas + 1 })),
    menosLinha: () =>
      faz('− Linha', (x) =>
        x.linhas > 1 ? { ...x, linhas: x.linhas - 1, l: Math.min(x.l, x.linhas - 2) } : x,
      ),
    menosColuna: () =>
      faz('− Coluna', (x) =>
        x.colunas > 1 ? { ...x, colunas: x.colunas - 1, c: Math.min(x.c, x.colunas - 2) } : x,
      ),
  };
  const tecla = (e: KeyboardEvent) => {
    const anda: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    if (!e.altKey && anda[e.code]) {
      e.preventDefault();
      const [dl, dc] = anda[e.code] ?? [0, 0];
      setG((x) => ({
        ...x,
        l: Math.max(0, Math.min(x.linhas - 1, x.l + dl)),
        c: Math.max(0, Math.min(x.colunas - 1, x.c + dc)),
      }));
      return;
    }
    if (!nova || !e.altKey) return;
    const mapa: Record<string, () => void> = e.shiftKey
      ? {
          ArrowDown: cmd.linhaAbaixo,
          ArrowUp: cmd.linhaAcima,
          ArrowRight: cmd.colunaDireita,
          ArrowLeft: cmd.colunaEsquerda,
          Backspace: cmd.menosColuna,
        }
      : { Backspace: cmd.menosLinha };
    const f = mapa[e.code];
    if (f) {
      e.preventDefault();
      f();
    }
  };
  const k = (t: string) => (nova ? t : undefined);
  return (
    <div className="qv-lado" tabIndex={0} onKeyDown={tecla}>
      <span className="qv-rotulo">{nova ? 'Proposta' : 'Hoje'}</span>
      <div className="qv-barra" role="toolbar" aria-label="Tabela">
        <Button
          variant="quiet"
          {...(k('Alt Shift ↓') && { shortcut: 'Alt Shift ↓' })}
          onPress={cmd.linhaAbaixo}
        >
          + Linha
        </Button>
        <Button
          variant="quiet"
          {...(k('Alt Shift →') && { shortcut: 'Alt Shift →' })}
          onPress={cmd.colunaDireita}
        >
          + Coluna
        </Button>
        <Button variant="quiet" {...(k('Alt ⌫') && { shortcut: 'Alt ⌫' })} onPress={cmd.menosLinha}>
          − Linha
        </Button>
        <Button
          variant="quiet"
          {...(k('Alt Shift ⌫') && { shortcut: 'Alt Shift ⌫' })}
          onPress={cmd.menosColuna}
        >
          − Coluna
        </Button>
        <Button variant="quiet" shortcut="Alt R" onPress={() => setUltima('Ajustar')}>
          Ajustar
        </Button>
      </div>
      <table className="qv-tabela">
        <tbody>
          {Array.from({ length: g.linhas }, (_, l) => (
            <tr key={l}>
              {Array.from({ length: g.colunas }, (_, c) => (
                <td key={c} data-aqui={l === g.l && c === g.c}>
                  {l === g.l && c === g.c ? 'cursor' : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="qv-dica">
        Clique aqui; setas andam nas células.{' '}
        {nova ? 'Experimente Alt Shift ↓ →, Alt ⌫.' : 'Os comandos só pelo mouse.'} Última:{' '}
        <b>{ultima}</b>
      </p>
    </div>
  );
}

export function SecaoTabela() {
  return (
    <section className="qv-secao">
      <h2>2. Tabela nas Anotações: comandos pelo teclado</h2>
      <p>
        Valem só com o cursor dentro de uma tabela (como as teclas do modo Ajustar). Alt Shift +
        seta acrescenta na direção da seta; Alt ⌫ tira a linha, Alt Shift ⌫ tira a coluna. "Igualar
        colunas" ganha a tecla = dentro do modo Ajustar. "Apagar tabela" fica só no botão
        (destrutivo; Ctrl Z do editor desfaz).
      </p>
      <div className="qv-par">
        <Tabela nova={false} />
        <Tabela nova />
      </div>
    </section>
  );
}

function Faixa({ nova }: { nova: boolean }) {
  const [toque, setToque] = useState(false);
  const [clicado, setClicado] = useState('—');
  const [tipo, setTipo] = useState('—');
  const desce = (e: PointerEvent) => {
    setTipo(e.pointerType);
    setToque(nova ? e.pointerType === 'touch' || e.pointerType === 'pen' : true);
  };
  const tecla = () => setToque(false);
  return (
    <div className="qv-lado" tabIndex={0} onKeyDown={tecla}>
      <span className="qv-rotulo">{nova ? 'Proposta' : 'Hoje'}</span>
      <div className="qv-faixa" data-toque={toque} onPointerDownCapture={desce}>
        {['N', 'I', 'S', 'H1', 'H2', '•', '1.'].map((b) => (
          <button key={b} type="button" onClick={() => setClicado(b)}>
            {b}
          </button>
        ))}
      </div>
      <p className="qv-saida">
        Clique recebido: {clicado} · ponteiro: {tipo} · modo: {toque ? 'toque' : 'teclado/mouse'}
      </p>
      <p className="qv-dica">
        Clique aqui, aperte qualquer tecla (volta ao modo teclado) e clique com o mouse perto da
        borda direita de um botão.{' '}
        {nova
          ? 'Na proposta a faixa não muda de tamanho com mouse.'
          : 'Hoje a faixa cresce no meio do clique e o clique pode cair no vizinho.'}
      </p>
    </div>
  );
}

export function SecaoEntrada() {
  return (
    <section className="qv-secao">
      <h2>3. Defeito: botões crescem no primeiro clique do mouse</h2>
      <p>
        Causa: o listener único trata todo pointerdown como toque e o store grava
        data-entrada="toque". Com isso as regras de toque aumentam os botões para 44 px entre o
        apertar e o soltar do mouse. Correção: só vira "toque" quando o ponteiro é dedo ou caneta;
        mouse vira "mouse", que esconde o cursor como hoje, mas não aumenta nada.
      </p>
      <div className="qv-par">
        <Faixa nova={false} />
        <Faixa nova />
      </div>
    </section>
  );
}
