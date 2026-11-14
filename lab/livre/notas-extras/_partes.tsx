// Partes comuns da bancada notas-extras. O teclado aqui é simulado (um listener só da bancada);
// no app cada tecla vira linha da tabela de teclas (src/core/keyboard/keys.ts).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NOTAS_BOLETIM } from '../../_dados';
import { Block } from '../../../src/ui/components/Block';
import { Button } from '../../../src/ui/components/Button';
import { Field } from '../../../src/ui/components/Controls';
import { FilterChip } from '../../../src/ui/components/Filter';
import { Key } from '../../../src/ui/components/Key';
import { Window, WindowFooter } from '../../../src/ui/components/Window';
import { dispatch } from '../../../src/ui/keyboard/store';
import {
  AvalRow,
  BimesterTile,
  GoalIsland,
  Of,
  SemesterFaixa,
  Soft,
  SummaryLines,
  cx,
} from '../../../src/ui/components/Grades';
import { f1, falta2, falta4, fechado, media, pontos, semestre, type Falta, type Materia } from './_conta';
import './notas-extras.css';

const pedido = new URLSearchParams(location.search);
export const JANELA = 'nx-esquema';

export type Modelo = '5+5' | '3+7' | 'outro';
export const modeloDe = (v: readonly number[]): Modelo =>
  v[0] === 5 && v[2] === 5 ? '5+5' : v[0] === 3 && v[2] === 3 ? '3+7' : 'outro';

export function useNotas(inicio = 'IMU') {
  const [materias, setMaterias] = useState<Materia[]>(() => NOTAS_BOLETIM.map((m) => ({ ...m })));
  const [aberta, setAberta] = useState(pedido.get('materia') ?? inicio);
  const [busca, setBusca] = useState<string | null>(pedido.get('busca'));
  const [cursor, setCursor] = useState(0);
  const [meta, setMeta] = useState(7);
  const [janela, setJanela] = useState(pedido.get('janela') === '1');
  const [mais, setMais] = useState(pedido.get('mais') === '1');
  const [jc, setJc] = useState(Number(pedido.get('jc') ?? 0));
  const ativar = useRef<(i: number) => void>(() => {});
  const termo = (busca ?? '').trim().toLowerCase();
  const vistas = materias.filter(
    (m) =>
      termo === '' ||
      m.sigla.toLowerCase().startsWith(termo) ||
      m.nome.toLowerCase().includes(termo),
  );
  const materia = materias.find((m) => m.sigla === aberta) ?? materias[0]!;
  const salvarVale = (vale: Materia['vale']) =>
    setMaterias((l) => l.map((m) => (m.sigla === materia.sigla ? { ...m, vale } : m)));
  useEffect(() => {
    if (janela) dispatch({ type: 'openWindow', window: JANELA });
  }, []);
  return {
    materias,
    vistas,
    materia,
    aberta,
    setAberta,
    busca,
    setBusca,
    cursor,
    setCursor,
    meta,
    setMeta,
    janela,
    setJanela,
    mais,
    setMais,
    jc,
    setJc,
    salvarVale,
    ativar,
  };
}
export type Notas = ReturnType<typeof useNotas>;

export function abrirJanela(n: Notas) {
  n.setJanela(true);
  n.setJc(0);
  dispatch({ type: 'openWindow', window: JANELA });
}
export function fecharJanela(n: Notas) {
  n.setJanela(false);
  n.setMais(false);
  dispatch({ type: 'escape' });
}

const ehBarra = (e: KeyboardEvent) =>
  e.code === 'IntlRo' || e.code === 'NumpadDivide' || e.code === 'Slash';

/** Teclado simulado: régua (←→ Enter /), busca (texto, Enter, Esc) e janela (setas, Enter, Esc). */
export function useTeclas(n: Notas) {
  const campo = useRef<HTMLInputElement>(null);
  const ref = useRef(n);
  ref.current = n;
  useEffect(() => {
    const aoTecla = (e: KeyboardEvent) => {
      const n = ref.current;
      const opcoesJanela = 5;
      const ativar = (i: number) => n.ativar.current(i);
      const noCampo = e.target === campo.current;
      const noTexto = e.target instanceof HTMLInputElement;
      if (n.janela) {
        if (e.code === 'Escape') fecharJanela(n);
        else if (noTexto && e.code !== 'Enter') return;
        else if (['ArrowRight', 'ArrowDown'].includes(e.code)) n.setJc((n.jc + 1) % opcoesJanela);
        else if (['ArrowLeft', 'ArrowUp'].includes(e.code))
          n.setJc((n.jc - 1 + opcoesJanela) % opcoesJanela);
        else if (e.code === 'Enter') ativar(n.jc);
        else return;
      } else if (noCampo) {
        if (e.code === 'Escape') {
          n.setBusca(null);
          campo.current?.blur();
        } else if (e.code === 'Enter') {
          const primeira = n.vistas[0];
          if (primeira) n.setAberta(primeira.sigla);
          n.setBusca(null);
          n.setCursor(n.materias.findIndex((m) => m.sigla === primeira?.sigla) + 1);
          campo.current?.blur();
        } else return;
      } else if (noTexto || e.altKey || e.ctrlKey || e.metaKey) {
        return;
      } else if (ehBarra(e)) {
        n.setBusca('');
        setTimeout(() => campo.current?.focus());
      } else if (e.code === 'ArrowRight') n.setCursor(Math.min(n.cursor + 1, n.vistas.length));
      else if (e.code === 'ArrowLeft') n.setCursor(Math.max(n.cursor - 1, 0));
      else if (e.code === 'Enter') {
        const m = n.vistas[n.cursor - 1];
        n.setAberta(m ? m.sigla : '');
      } else if (e.code === 'KeyE') abrirJanela(n);
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener('keydown', aoTecla, true);
    return () => document.removeEventListener('keydown', aoTecla, true);
  }, []);
  useEffect(() => {
    if (n.busca !== null && pedido.has('busca')) campo.current?.focus();
  }, []);
  return campo;
}

/** Régua de matérias com a busca `/` no começo. */
export function Regua({ n, campo }: { n: Notas; campo: React.RefObject<HTMLInputElement | null> }) {
  const buscando = n.busca !== null;
  return (
    <Block id="nx-regua" fixed="none">
      <div className={`${cx('nb-regua')} nx-regua`}>
        {buscando ? (
          <span className="nx-busca">
            <Field
              ref={campo}
              label="Buscar matéria"
              value={n.busca ?? ''}
              onChange={(e) => n.setBusca(e.target.value)}
            />
            <Soft>{n.vistas.length === 0 ? 'nada' : `Enter abre ${n.vistas[0]?.sigla}`}</Soft>
          </span>
        ) : (
          <button
            type="button"
            className="nx-lupa"
            onClick={() => {
              n.setBusca('');
              setTimeout(() => campo.current?.focus());
            }}
            aria-label="Buscar matéria"
          >
            <span>Buscar</span>
            <Key>/</Key>
          </button>
        )}
        {!buscando && (
          <FilterChip
            selected={n.aberta === ''}
            cursor={n.cursor === 0}
            onOpen={() => n.setAberta('')}
          >
            Boletim geral
          </FilterChip>
        )}
        {n.vistas.map((m, i) => (
          <FilterChip
            key={m.sigla}
            subject={m.cor}
            selected={n.aberta === m.sigla}
            cursor={!buscando && n.cursor === i + 1}
            onOpen={() => {
              n.setAberta(m.sigla);
              n.setBusca(null);
            }}
          >
            {`${m.sigla}  ${f1(media(m))}`}
          </FilterChip>
        ))}
        {buscando && n.vistas.length === 0 && <Soft>Nenhuma matéria com “{n.busca}”</Soft>}
      </div>
    </Block>
  );
}

const tile = (m: Materia, b: number, meta: number) => {
  const av = m.bim[b] ?? [];
  const vale = m.vale[b] ?? 5;
  const p = pontos(av, vale);
  const soma = av.reduce((s, a) => s + a.max, 0);
  return {
    name: `${b + 1}º bim.`,
    worth: vale,
    points: p,
    grade10: p === null ? null : (p / vale) * 10,
    convert: av.length > 0 && Math.abs(soma - vale) > 0.01,
    low: p !== null && (p / vale) * 10 < meta,
  };
};

/** Linhas de "quanto falta": só números (nada de barra ou medidor). */
export function linhasFalta(f: Falta, onde: string, vale: number): [string, ReactNode][] {
  switch (f.tipo) {
    case 'sem-dados':
      return [[`Precisa no ${onde}`, <Soft key="s">falta nota antes</Soft>]];
    case 'fechado':
      return [];
    case 'garantido':
      return [
        [
          `Precisa no ${onde}`,
          <b key="g" className="nx-ok">
            já garantido
          </b>,
        ],
      ];
    case 'impossivel':
      return [
        [
          `Precisa no ${onde}`,
          <b key="i" className="nx-nao">
            não dá mais
          </b>,
        ],
      ];
    case 'precisa': {
      const l: [string, ReactNode][] = [
        [
          `Precisa no ${onde}`,
          <span key="p" className={cx('nc-par')}>
            <b>{f1(f.pontos)}</b> <Of value={vale} />
          </span>,
        ],
      ];
      if (f.restante) {
        const r = f.restante;
        l.push([
          r.quantas === 1 ? 'Na avaliação que falta' : `Nas ${r.quantas} que faltam`,
          <span key="r" className={cx('nc-par')}>
            <b>{f1(r.tirar)}</b> <Of value={r.valem} />
          </span>,
        ]);
      } else if (Math.abs(vale - 10) > 0.01)
        l.push(['Em nota de 0 a 10', <b key="n">{f1(f.nota)}</b>]);
      return l;
    }
  }
}

export function Disciplina({ n, meta, lado }: { n: Notas; meta?: 'faixa'; lado?: ReactNode }) {
  const m = n.materia;
  const [bim, setBim] = useState(m.bim[1].length > 0 && m.bim[2].length === 0 ? 1 : 3);
  const f2 = falta2(m, n.meta);
  const f4 = falta4(m, n.meta);
  const s1 = fechado(m, 1);
  const s2 = fechado(m, 2);
  const av = m.bim[bim] ?? [];
  const noFaixa = (s: 1 | 2) => {
    const f = s === 1 ? f2 : f4;
    const linhas = linhasFalta(f, s === 1 ? '2º bim.' : '4º bim.', m.vale[s === 1 ? 1 : 3]);
    if (linhas.length === 0 || f.tipo === 'sem-dados') return null;
    return (
      <div className="nx-faixa-meta">
        {linhas.map(([rotulo, valor]) => (
          <span key={rotulo}>
            <Soft>{rotulo}</Soft> {valor}
          </span>
        ))}
      </div>
    );
  };
  return (
    <div className={`${cx('nt-m1')} nx-m1`}>
      <Block
        id="nx-faixas"
        title={m.nome}
        count={`esquema ${f1(m.vale[0])} + ${f1(m.vale[1])}`}
        tools={
          <Button variant="quiet" onPress={() => abrirJanela(n)}>
            Esquema
          </Button>
        }
        menu
        fixed="none"
      >
        <div className={cx('nt-faixas')}>
          {[1, 2].map((s) => (
            <div key={s} className="nx-sem">
              <SemesterFaixa label={`${s}º semestre`} total={s === 1 ? s1 : s2}>
                {[0, 1].map((k) => {
                  const b = (s - 1) * 2 + k;
                  return (
                    <span
                      key={b}
                      onClick={() => setBim(b)}
                      className="nx-tile"
                      data-sel={b === bim ? '' : undefined}
                    >
                      <BimesterTile tile={tile(m, b, n.meta)} block="nx-faixas" index={b} />
                    </span>
                  );
                })}
              </SemesterFaixa>
              {meta === 'faixa' && noFaixa(s as 1 | 2)}
            </div>
          ))}
        </div>
      </Block>
      <Block
        id="nx-avals"
        title={`Avaliações do ${bim + 1}º bim.`}
        count={`${av.length} · vale ${f1(m.vale[bim] ?? 5)}`}
        menu
        fixed="none"
      >
        <div className={cx('nt-lista')}>
          {av.length === 0 && <p className={cx('nb-apoio')}>Nenhuma avaliação neste bimestre.</p>}
          {av.map((a, i) => (
            <AvalRow
              key={a.nome}
              name={a.nome}
              note=""
              grade={a.nota}
              max={a.max}
              low={a.nota !== null && (a.nota / a.max) * 10 < n.meta}
              block="nx-avals"
              index={i}
              onOpen={() => {}}
            />
          ))}
        </div>
      </Block>
      <div className={cx('nt-lado')}>
        <Block id="nx-resumo" title="Resumo" fixed="none">
          <div className={cx('nt-pad')}>
            <SummaryLines
              lines={[
                ['1º semestre', s1 === null ? <Soft key="a">em aberto</Soft> : f1(s1)],
                ['2º semestre', s2 === null ? <Soft key="b">em aberto</Soft> : f1(s2)],
                ['Média até agora', f1(media(m))],
              ]}
            >
              <GoalIsland
                value={n.meta}
                block="nx-resumo"
                onStep={(d) => n.setMeta(Math.min(10, Math.max(0, n.meta + d)))}
              />
            </SummaryLines>
          </div>
        </Block>
        {lado}
      </div>
    </div>
  );
}

export function Teclas({ itens }: { itens: [string, string][] }) {
  return (
    <p className="nx-teclas">
      {itens.map(([k, t]) => (
        <span key={k}>
          <Key>{k}</Key> {t}
        </span>
      ))}
    </p>
  );
}

export { Window, WindowFooter, Button, Soft, cx, f1, falta2, falta4, semestre };
