import { leaf, leaves, split } from '../../../core/mosaic/tree';
import { currentEventIndex, eventsOn, subjectOf } from '../../../core/study/queries';
import type { StudyData } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { dispatch, getKeyboardState } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { Mosaic } from '../../mosaic/Mosaic';
import { useMosaic } from '../../mosaic/useMosaic';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { notesBarVisible, setNotesBar } from '../../study/notesBar';
import { cardOptions } from '../../study/editOptions';
import { MESA_LESSON } from '../../study/navigation';
import { useScreenMemory } from '../../study/screenMemory';
import { nowTime, today, useStudy } from '../../study/study';
import { CardsBlock, useCardsEditor } from './CardsBlock';
import styles from './Mesa.module.css';
import { focusToolbar, HistoryWindow, NotesBlock, stepToolbar } from './NotesBlock';
import { editorActions, useNotesEditor } from './useNotesEditor';

const SLIDES = 'mesa.slides';
const NOTES = 'mesa.notes';
const CARDS = 'mesa.cards';
const ALL = [SLIDES, NOTES, CARDS];
const INITIAL = split('row', split('col', leaf(SLIDES), leaf(CARDS), 0.58), leaf(NOTES));

const TOGGLES = [
  { id: SLIDES, label: 'Slides', keys: 'Alt S' },
  { id: NOTES, label: 'Anotações', keys: 'Alt A' },
  { id: CARDS, label: 'Cartões', keys: 'Alt C' },
];

function defaultLesson(data: StudyData): string {
  const events = eventsOn(data, today);
  const event = events[currentEventIndex(events, nowTime)];
  return event?.lessonId ?? data.lessons[0]?.id ?? '';
}

export function Mesa() {
  const data = useStudy();
  const [lessonId] = useScreenMemory(MESA_LESSON, defaultLesson(data));
  return <LessonDesk key={lessonId} data={data} lessonId={lessonId} />;
}

const toggleBar = () => setNotesBar(!notesBarVisible());

function LessonDesk({ data, lessonId }: { data: StudyData; lessonId: string }) {
  const lesson = data.lessons.find((item) => item.id === lessonId);
  const subject = lesson && subjectOf(data, lesson.subjectId);
  const cards = data.cards.filter((card) => card.lessonId === lessonId);
  const pages = lesson?.slides ?? 1;
  const mosaic = useMosaic(`aula-${lessonId}`, INITIAL, ALL);
  const [page, setPage] = useScreenMemory(`mesa.pagina.${lessonId}`, 1);

  const editor = useNotesEditor(lessonId, lesson?.notes ?? '');
  const cardsEditor = useCardsEditor(CARDS, lessonId);
  const inCards = () => getKeyboardState().focus.block === CARDS;
  const inNotes = () => getKeyboardState().focus.block === NOTES;

  useBlocks({
    blocks: [
      { id: SLIDES, kind: 'none' as const },
      { id: NOTES, kind: 'text' as const },
      cardsEditor.mode === 'novo'
        ? { id: CARDS, kind: 'text' as const }
        : {
            id: CARDS,
            kind: 'nav' as const,
            nav: { axis: 'grid' as const, count: cards.length, columns: 2 },
          },
    ].filter((block) => mosaic.isOpen(block.id)),
    arrival: mosaic.isOpen(NOTES)
      ? { block: NOTES, level: 'field' }
      : { block: leaves(mosaic.tree)[0] ?? '', level: 'block' },
    options: (block) => [
      ...mosaic.options(block),
      ...(block === NOTES
        ? [
            {
              id: 'barra',
              label: notesBarVisible()
                ? 'Ocultar barra de formatação'
                : 'Mostrar barra de formatação',
              keys: 'Alt T',
              run: toggleBar,
            },
            {
              id: 'historico',
              label: 'Histórico de versões',
              run: () => dispatch({ type: 'openWindow', window: 'historico' }),
            },
          ]
        : []),
      ...(block === CARDS && cardsEditor.mode === 'salvos'
        ? cardOptions(cards[getKeyboardState().focus.items[CARDS] ?? 0])
        : []),
      ...(block === CARDS
        ? [
            cardsEditor.mode === 'novo'
              ? {
                  id: 'salvos',
                  label: 'Ver cartões salvos',
                  run: () => cardsEditor.setMode('salvos'),
                }
              : { id: 'novo', label: 'Escrever cartões', run: cardsEditor.newCard },
          ]
        : []),
    ],
    actions: {
      ...mosaic.actions,
      ...editorActions(editor, page),
      saveCards: () => {
        if (!inCards()) return false;
        cardsEditor.save();
      },
      // Na Mesa, o único item novo é o cartão: Alt N cria de qualquer bloco, sem largar a aula.
      newItem: () => {
        if (!mosaic.isOpen(CARDS)) mosaic.toggle(CARDS);
        cardsEditor.newCard();
      },
      // Alt T mostra ou oculta a barra (modo fantasma); Alt B vai a ela, mostrando-a se preciso.
      goToTopBar: () => inNotes() && toggleBar(),
      goToBottomBar: () => {
        if (!inNotes()) return false;
        if (notesBarVisible()) return focusToolbar();
        setNotesBar(true);
        setTimeout(focusToolbar, 0);
      },
      previousControl: () => stepToolbar(-1),
      nextControl: () => stepToolbar(1),
      changePage: (change) => {
        if (change.type !== 'changePage') return false;
        setPage(Math.min(pages, Math.max(1, page + change.step)));
      },
    },
  });

  function render(id: string) {
    if (id === SLIDES) {
      return (
        <Block id={id} title="Slides" count={`${page} de ${pages}`} shortcut="Alt S" menu>
          <div className={styles.folha}>
            <p className={styles.slide}>Página {page}</p>
          </div>
        </Block>
      );
    }
    if (id === NOTES) {
      return <NotesBlock id={id} editor={editor} />;
    }
    return <CardsBlock id={id} cards={cards} editor={cardsEditor} />;
  }

  return (
    <ScreenFrame
      title={lesson?.title}
      caps={false}
      end={
        <>
          <span className={styles.sigla} data-materia={subject?.color}>
            {subject?.code}
          </span>
          <div className={styles.alternar} role="group" aria-label="Blocos">
            {TOGGLES.map(({ id, label, keys }) => (
              <button
                key={id}
                type="button"
                className={styles.pilula}
                data-sel={mosaic.isOpen(id)}
                aria-pressed={mosaic.isOpen(id)}
                title={keys}
                onClick={() => mosaic.toggle(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      }
    >
      <Mosaic
        tree={mosaic.tree}
        maximized={mosaic.maximized}
        render={render}
        onChange={mosaic.setTree}
      />
      <HistoryWindow lessonId={lessonId} editor={editor} />
      {mosaic.resizing && (
        <div className={styles.aviso} role="status">
          Redimensionar: setas ajustam, Enter ou Esc termina
          <button
            type="button"
            className={styles.pronto}
            onClick={() => dispatch({ type: 'escape' })}
          >
            Pronto
          </button>
        </div>
      )}
    </ScreenFrame>
  );
}
