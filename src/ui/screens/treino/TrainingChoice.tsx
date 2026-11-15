import { useEffect, useRef, useState } from 'react';
import { ankiTsv } from '../../../core/study/ankiExport';
import {
  describeScope,
  dueCards,
  emptyScope,
  isEmptyScope,
  lessonGroups,
  parseScope,
  periodChoices,
  pruneScope,
  scopeCards,
  stringifyScope,
  toggleIn,
  toggleSubject,
  yearChoices,
  type Scope,
} from '../../../core/study/scope';
import { capTiles, subjectTiles } from '../../../core/study/subjectTiles';
import { useSelectedIndex } from '../../components/NavItem';
import { dispatch, getKeyboardState } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { downloadText, fileSlug } from '../../study/download';
import { storage, today, useStudy } from '../../study/study';
import {
  ANO,
  AULAS,
  Bar,
  barIndexes,
  BARRA,
  BIMESTRE,
  BUSCA,
  COLUNAS,
  DISCIPLINAS,
  LessonsPanel,
  MODOS,
  Modos,
  RulerBlock,
  SummaryPanels,
  SubjectsPanel,
} from './ChoiceParts';
import styles from './Escolha.module.css';

const SAVED_KEY = 'treino.filtros';

interface TrainingChoiceProps {
  onStart: (cardIds: string[]) => void;
}

export function TrainingChoice({ onStart }: TrainingChoiceProps) {
  const data = useStudy();
  // O Treino sempre abre em "Todos os cartões"; só os filtros do Personalizado ficam lembrados.
  const [custom, setCustom] = useState(false);
  const [saved, setSaved] = useState<Scope>(() =>
    pruneScope(data, parseScope(storage.getDeviceState(SAVED_KEY))),
  );
  const [query, setQuery] = useState('');
  const scope = custom ? saved : emptyScope();
  const change = (next: Scope) => {
    setSaved(next);
    storage.setDeviceState(SAVED_KEY, stringifyScope(next));
  };

  const years = yearChoices(data, today);
  const periods = periodChoices(data, today);
  const { shown: tiles, hidden } = capTiles(subjectTiles(data, today, query), saved.subjects);
  const summary = capTiles(subjectTiles(data, today, ''), []);
  const groups = lessonGroups(data, saved, today);
  const lessonRows = groups.flatMap((group) => group.rows);

  const cards = scopeCards(data, scope);
  const due = dueCards(cards, today);
  const queue = due.length > 0 ? due : cards;
  const customCards = scopeCards(data, saved);
  const modeIndex = useSelectedIndex(MODOS, 2);
  const idx = barIndexes(custom);

  const clear = () => change(emptyScope());
  const start = () => {
    if (queue.length > 0) onStart(queue.map((card) => card.id));
  };
  // Exporta todos os cartões do recorte (não só os de hoje), prontos para o Anki (B02).
  const exportAnki = () => {
    if (cards.length === 0) return;
    downloadText(ankiTsv(cards), `anki-${fileSlug(describeScope(data, scope), 'cartoes')}.txt`);
  };

  const toggleYear = (id: string) => change({ ...saved, years: toggleIn(saved.years, id) });
  const togglePeriod = (id: string) => change({ ...saved, periods: toggleIn(saved.periods, id) });
  const toggleLesson = (id: string) => change({ ...saved, lessons: toggleIn(saved.lessons, id) });
  const toggleSubjectId = (id: string) => change(toggleSubject(data, saved, id));

  // Espaço e Enter marcam o item sob o cursor nos blocos de filtro.
  const markFocused = (): boolean => {
    const { focus } = getKeyboardState();
    if (focus.level !== 'nav') return false;
    const at = focus.items[focus.block] ?? 0;
    const year = years[at];
    const period = periods[at];
    const tile = tiles[at];
    const lesson = lessonRows[at];
    if (focus.block === ANO && year) toggleYear(year.id);
    else if (focus.block === BIMESTRE && period) togglePeriod(period.id);
    else if (focus.block === DISCIPLINAS && tile) toggleSubjectId(tile.id);
    else if (focus.block === AULAS && lesson) toggleLesson(lesson.id);
    else return false;
    return true;
  };

  // Na abertura o cursor nasce no Iniciar; depois, andar pelos modos já escolhe.
  const opened = useRef(false);
  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      dispatch({
        type: 'jump',
        block: BARRA,
        level: 'nav',
        items: { [MODOS]: 0, [BARRA]: barIndexes(false).start },
      });
      return;
    }
    const next = modeIndex === 1;
    setCustom(next);
    dispatch({
      type: 'jump',
      block: MODOS,
      level: 'nav',
      items: { [BARRA]: barIndexes(next).start },
    });
  }, [modeIndex]);

  const hasSubject = saved.subjects.length > 0;
  const hasLessons = hasSubject && lessonRows.length > 0;
  const lower = hasLessons ? AULAS : DISCIPLINAS;
  useBlocks({
    blocks: [
      {
        id: MODOS,
        kind: 'nav',
        nav: { axis: 'x', count: 2 },
        neighbors: { down: custom ? ANO : BARRA },
        enterGoesTo: BARRA,
      },
      ...(custom
        ? [
            {
              id: ANO,
              kind: 'nav' as const,
              nav: { axis: 'x' as const, count: Math.max(1, years.length) },
              neighbors: { up: MODOS, right: BIMESTRE, down: BUSCA },
              onActivate: markFocused,
            },
            {
              id: BIMESTRE,
              kind: 'nav' as const,
              nav: { axis: 'x' as const, count: Math.max(1, periods.length) },
              neighbors: { up: MODOS, left: ANO, down: lower },
              onActivate: markFocused,
            },
            { id: BUSCA, kind: 'text' as const, neighbors: { up: ANO, down: DISCIPLINAS } },
            {
              id: DISCIPLINAS,
              kind: 'nav' as const,
              nav: { axis: 'grid' as const, count: tiles.length, columns: COLUNAS },
              neighbors: { up: BUSCA, down: BARRA, ...(hasLessons ? { right: AULAS } : {}) },
              onActivate: markFocused,
            },
            ...(hasLessons
              ? [
                  {
                    id: AULAS,
                    kind: 'nav' as const,
                    nav: { axis: 'y' as const, count: lessonRows.length },
                    neighbors: { up: BIMESTRE, left: DISCIPLINAS, down: BARRA },
                    onActivate: markFocused,
                  },
                ]
              : []),
          ]
        : []),
      {
        id: BARRA,
        kind: 'nav',
        nav: { axis: 'x', count: custom ? 3 : 2 },
        neighbors: { up: custom ? DISCIPLINAS : MODOS },
        onActivate: (index) => {
          if (index === idx.clear) clear();
          else if (index === idx.start) start();
          else exportAnki();
        },
      },
    ],
    arrival: { block: BARRA, level: 'nav', items: { [MODOS]: 0, [BARRA]: 0 } },
    actions: {
      flipCard: () => markFocused(),
      goToField: () => {
        if (!custom) return false;
        dispatch({ type: 'jump', block: BUSCA, level: 'field' });
        return true;
      },
    },
  });

  const changeQuery = (value: string) => {
    setQuery(value);
    dispatch({ type: 'jump', block: BUSCA, level: 'field', items: { [DISCIPLINAS]: 0 } });
  };

  return (
    <ScreenFrame title="Treino">
      <div className={styles.tela}>
        <div className={styles.pilha}>
          <Modos
            custom={custom}
            allTotal={data.cards.length}
            customTotal={customCards.length}
            customEmpty={isEmptyScope(saved)}
          />
          {!custom && <SummaryPanels tiles={summary.shown} hidden={summary.hidden} years={years} />}
          {custom && (
            <>
              <div className={styles.par}>
                <RulerBlock
                  id={ANO}
                  label="Ano"
                  choices={years}
                  marked={saved.years}
                  onToggle={toggleYear}
                />
                <RulerBlock
                  id={BIMESTRE}
                  label="Bimestre"
                  choices={periods}
                  marked={saved.periods}
                  onToggle={togglePeriod}
                />
              </div>
              <div className={`${styles.par} ${styles.meio}`}>
                <SubjectsPanel
                  tiles={tiles}
                  hidden={hidden}
                  query={query}
                  marked={saved.subjects}
                  onQuery={changeQuery}
                  onSubmit={() => {
                    if (tiles.length > 0) {
                      dispatch({ type: 'jump', block: DISCIPLINAS, level: 'nav' });
                    }
                  }}
                  onToggle={toggleSubjectId}
                />
                <LessonsPanel groups={groups} hasSubject={hasSubject} onToggle={toggleLesson} />
              </div>
            </>
          )}
          <Bar
            custom={custom}
            due={due.length}
            total={cards.length}
            startLabel={startLabel(due.length, cards.length)}
            canStart={cards.length > 0}
            onClear={clear}
            onStart={start}
            onExport={exportAnki}
          />
        </div>
      </div>
    </ScreenFrame>
  );
}

// Sem cartão vencido, ainda dá para adiantar: estudar uma aula antes da prova, por exemplo.
function startLabel(due: number, total: number): string {
  if (due > 0) return 'Iniciar treino';
  if (total > 0) return `Adiantar ${total} ${total === 1 ? 'cartão' : 'cartões'}`;
  return 'Nada para treinar';
}
