import { useEffect, useRef, useState } from 'react';
import {
  describeScope,
  dueCards,
  EVERYTHING,
  fullScope,
  scopeCards,
  scopePeriods,
  scopeRows,
  togglePick,
  type Scope,
} from '../../../core/study/scope';
import { capTiles, subjectTiles } from '../../../core/study/subjectTiles';
import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { dispatch } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { useScreenMemory } from '../../study/screenMemory';
import { today, useStudy } from '../../study/study';
import styles from './Treino.module.css';
import inicio from './Inicio.module.css';

const SUMMARY = 'treino.resumo';
const PERIOD = 'treino.periodo';
const SEARCH = 'treino.busca';
const SUBJECTS = 'treino.materias';
const ROWS = 'treino.escolha';
const COLUMNS = 7;

interface Saved {
  subjectId: string | null;
  picks: readonly string[];
}

interface TrainingChoiceProps {
  onStart: (cardIds: string[]) => void;
}

export function TrainingChoice({ onStart }: TrainingChoiceProps) {
  const data = useStudy();
  const [query, setQuery] = useState('');
  const [adjust, setAdjust] = useState(false);
  // A última escolha fica lembrada: quem treina o de sempre só aperta Enter.
  const [saved, setSaved] = useScreenMemory<Saved>('treino.escopo', {
    subjectId: null,
    picks: [EVERYTHING],
  });
  const searching = query.trim() !== '';
  const { shown: tiles, hidden } = capTiles(
    subjectTiles(data, today, query),
    searching ? null : saved.subjectId,
  );
  const tileIndex = useSelectedIndex(SUBJECTS, tiles.length);
  const subjectId = tiles[tileIndex]?.id ?? null;
  const periods = scopePeriods(data, subjectId);
  const periodIndex = useSelectedIndex(PERIOD, periods.length + 1);
  const picks = saved.subjectId === subjectId ? saved.picks : fullScope(subjectId).picks;
  const scope: Scope = { subjectId, picks };
  const rows = scopeRows(data, scope, today);
  const rowIndex = useSelectedIndex(ROWS, rows.length);
  const cards = scopeCards(data, scope);
  const due = dueCards(cards, today);
  const queue = due.length > 0 ? due : cards;

  // Andar pela régua de período já escolhe: a seleção segue o foco.
  const lastPeriod = useRef(periodIndex);
  useEffect(() => {
    if (lastPeriod.current === periodIndex) return;
    lastPeriod.current = periodIndex;
    const period = periods[periodIndex - 1];
    setSaved({ subjectId, picks: period ? [period.id] : [EVERYTHING] });
  });

  const toggle = (index: number) => {
    const row = rows[index];
    if (row) setSaved({ subjectId, picks: togglePick(data, scope, row.id).picks });
  };
  const start = () => {
    if (queue.length > 0) onStart(queue.map((card) => card.id));
  };
  const goToSubjects = () =>
    dispatch({ type: 'jump', block: SUBJECTS, level: 'nav', items: { [SUBJECTS]: 0 } });

  const savedTile = Math.max(
    0,
    tiles.findIndex((tile) => tile.id === saved.subjectId),
  );
  const savedPeriod =
    saved.picks.length === 1 ? periods.findIndex((period) => period.id === saved.picks[0]) + 1 : 0;

  useBlocks({
    blocks: [
      {
        id: SUMMARY,
        kind: 'nav',
        nav: { axis: 'y', count: 2 },
        neighbors: { down: PERIOD, ...(adjust ? { right: ROWS } : {}) },
        onActivate: (index) => (index === 0 ? start() : setAdjust(!adjust)),
      },
      {
        id: PERIOD,
        kind: 'nav',
        nav: { axis: 'x', count: periods.length + 1 },
        neighbors: { up: SUMMARY, down: SUBJECTS },
        enterGoesTo: SUMMARY,
      },
      { id: SEARCH, kind: 'text', neighbors: { up: PERIOD, down: SUBJECTS } },
      {
        id: SUBJECTS,
        kind: 'nav',
        nav: { axis: 'grid', count: tiles.length, columns: COLUMNS },
        neighbors: { up: SEARCH },
        resets: [PERIOD, ROWS],
        enterGoesTo: SUMMARY,
      },
      ...(adjust
        ? [
            {
              id: ROWS,
              kind: 'nav' as const,
              nav: { axis: 'y' as const, count: rows.length },
              neighbors: { left: SUMMARY },
              onActivate: () => toggle(rowIndex),
            },
          ]
        : []),
    ],
    arrival: {
      block: SUMMARY,
      level: 'nav',
      items: { [SUBJECTS]: savedTile, [PERIOD]: savedPeriod, [ROWS]: 0 },
    },
    actions: { goToField: () => dispatch({ type: 'jump', block: SEARCH, level: 'field' }) },
  });

  const changeQuery = (value: string) => {
    setQuery(value);
    // O foco vai para a primeira que casa, e o período volta a "Todos".
    dispatch({
      type: 'jump',
      block: SEARCH,
      level: 'field',
      items: { [SUBJECTS]: 0, [PERIOD]: 0, [ROWS]: 0 },
    });
  };

  return (
    <ScreenFrame title="Treino">
      <div className={inicio.tela}>
        <div className={inicio.coluna}>
          <Block id={SUMMARY} className={inicio.resumo}>
            <span className={inicio.rotulo}>Sua sessão</span>
            <span className={inicio.numero}>{due.length}</span>
            <span className={inicio.legenda}>
              {cards.length === 0
                ? 'Nenhum cartão aqui. Crie cartões no bloco Cartões da Mesa.'
                : due.length === 1
                  ? 'cartão para hoje'
                  : 'cartões para hoje'}
            </span>
            <span className={inicio.recorte}>{describeScope(data, scope)}</span>
            <span className={inicio.info}>
              {cards.length} {cards.length === 1 ? 'cartão' : 'cartões'} no recorte
            </span>
            <NavItem
              block={SUMMARY}
              index={0}
              className={inicio.iniciar}
              ring="anel"
              onOpen={start}
            >
              {startLabel(due.length, cards.length)}
              <kbd className={inicio.tecla}>Enter</kbd>
            </NavItem>
            <NavItem
              block={SUMMARY}
              index={1}
              className={inicio.ajustar}
              ring="anel"
              onOpen={() => setAdjust(!adjust)}
            >
              {adjust ? 'Ocultar o que treinar' : 'Ajustar o que treinar'}
              <span aria-hidden="true">{adjust ? ' ‹' : ' ›'}</span>
            </NavItem>
          </Block>

          <Block id={PERIOD} className={inicio.periodo}>
            <span className={inicio.rotulo}>Estudar</span>
            <div className={inicio.regua}>
              {['Todos', ...periods.map((period) => period.label)].map((label, index) => (
                <NavItem
                  key={label}
                  block={PERIOD}
                  index={index}
                  className={inicio.periodoItem}
                  ring="anel"
                >
                  {label}
                </NavItem>
              ))}
            </div>
          </Block>

          <Block id={SEARCH} className={inicio.busca}>
            <form
              className={inicio.buscaForm}
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                if (tiles.length > 0) goToSubjects();
              }}
            >
              <span className={inicio.rotulo}>Disciplina</span>
              <input
                className={inicio.campo}
                data-field
                aria-label="Buscar disciplina"
                placeholder="Digite a sigla ou o nome"
                value={query}
                onChange={(event) => changeQuery(event.target.value)}
              />
              <kbd className={inicio.tecla}>Alt F</kbd>
            </form>
          </Block>

          <Block id={SUBJECTS} className={inicio.materias}>
            <div className={inicio.grade}>
              {tiles.map((tile, index) => (
                <NavItem
                  key={tile.id ?? 'todas'}
                  block={SUBJECTS}
                  index={index}
                  className={inicio.peca}
                  ring="anel"
                  label={`${tile.name}, ${dueLabel(tile.due)}`}
                >
                  {tile.color === null ? (
                    <b className={inicio.todas}>Todas</b>
                  ) : (
                    <span className={inicio.sigla} data-materia={tile.color}>
                      {tile.code}
                    </span>
                  )}
                  <b className={inicio.contagem}>{tile.due > 0 ? tile.due : ''}</b>
                  <small className={inicio.situacao}>{tile.due > 0 ? 'hoje' : 'em dia'}</small>
                </NavItem>
              ))}
            </div>
            {tiles.length === 0 && <p className={inicio.mais}>Nenhuma disciplina com “{query}”.</p>}
            {hidden > 0 && (
              <p className={inicio.mais}>
                + {hidden} {hidden === 1 ? 'disciplina' : 'disciplinas'} · digite para buscar
              </p>
            )}
          </Block>
        </div>

        {adjust && (
          <Block
            id={ROWS}
            title="O que treinar"
            count={String(rows.length)}
            className={inicio.lista}
          >
            <div className={styles.lista}>
              {rows.map((row, index) => (
                <NavItem
                  key={row.id}
                  block={ROWS}
                  index={index}
                  className={styles.linha}
                  onOpen={() => toggle(index)}
                >
                  <span
                    className={styles.marca}
                    data-tipo={row.kind}
                    aria-checked={row.checked}
                    role="checkbox"
                  >
                    {row.checked ? '✓' : ''}
                  </span>
                  <b className={styles.rotulo} data-tipo={row.kind}>
                    {row.label}
                  </b>
                  <span className={styles.contagem}>
                    {row.due > 0 ? `${row.due} hoje · ` : ''}
                    {row.total} {row.total === 1 ? 'cartão' : 'cartões'}
                  </span>
                </NavItem>
              ))}
            </div>
          </Block>
        )}
      </div>
    </ScreenFrame>
  );
}

const dueLabel = (due: number): string => (due > 0 ? `${due} hoje` : 'em dia');

// Sem cartão vencido, ainda dá para adiantar: estudar uma aula antes da prova, por exemplo.
function startLabel(due: number, total: number): string {
  if (due > 0) return 'Iniciar treino';
  if (total > 0) return `Adiantar ${total} ${total === 1 ? 'cartão' : 'cartões'}`;
  return 'Nada para treinar';
}
