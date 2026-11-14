import { clampPage, devicePageKey, slidesOf } from '../../../core/study/files';
import { useState } from 'react';
import { leaf, leaves, split } from '../../../core/mosaic/tree';
import { currentEventIndex, eventsOn, subjectOf } from '../../../core/study/queries';
import type { StudyData } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { BlockIcon } from '../../components/BlockIcon';
import { Button } from '../../components/Button';
import { SubjectPill } from '../../components/Pill';
import { ModeIndicator } from '../../components/Island';
import { BlockToggle, ToggleGroup } from '../../components/Toggles';
import { dispatch, getKeyboardState } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { Mosaic } from '../../mosaic/Mosaic';
import { useMosaic } from '../../mosaic/useMosaic';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { toggleColorTitles, toggleCompact, useCardView } from '../../study/cardView';
import { cardOptions } from '../../study/editOptions';
import { MESA_LESSON } from '../../study/navigation';
import { useScreenMemory } from '../../study/screenMemory';
import { attach, detach, pickFile } from '../../study/attach';
import { nowTime, storage, today, useStudy } from '../../study/study';
import { SlidesViewer } from './SlidesViewer';
import { CardsBlock } from './CardsBlock';
import { useCardsEditor } from './useCardsEditor';
import { useCardImagesEditor } from './useCardImagesEditor';
import styles from './Mesa.module.css';
import { focusBar, stepBar, withBarActions } from '../../keyboard/bars';
import { HistoryWindow, NotesBlock } from './NotesBlock';
import { editorActions, useNotesEditor } from './useNotesEditor';
import { cardFormatActions } from './cardActions';

const SLIDES = 'mesa.slides';
const NOTES = 'mesa.notes';
const CARDS = 'mesa.cards';
const ALL = [SLIDES, NOTES, CARDS];
const INITIAL = split('row', split('col', leaf(SLIDES), leaf(CARDS), 0.58), leaf(NOTES));

const TOGGLES = [
  { id: SLIDES, label: 'Slides', letter: 'S', icon: 'slides' as const },
  { id: NOTES, label: 'Anotações', letter: 'A', icon: 'notas' as const },
  { id: CARDS, label: 'Cartões', letter: 'C', icon: 'cartoes' as const },
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

function LessonDesk({ data, lessonId }: { data: StudyData; lessonId: string }) {
  const lesson = data.lessons.find((item) => item.id === lessonId);
  const subject = lesson && subjectOf(data, lesson.subjectId);
  const cards = data.cards.filter((card) => card.lessonId === lessonId);
  const slides = slidesOf(data, lessonId);
  const pages = slides?.pages ?? 1;
  const mosaic = useMosaic(`aula-${lessonId}`, INITIAL, ALL);
  const [stored, setStored] = useScreenMemory(
    `mesa.pagina.${lessonId}`,
    Number(storage.getDeviceState(devicePageKey(lessonId)) ?? 1),
  );
  const page = clampPage(stored, pages);
  const setPage = (next: number) => {
    setStored(next);
    storage.setDeviceState(devicePageKey(lessonId), String(next));
  };
  const [dropping, setDropping] = useState(false);
  const attachSlides = (file: File) => void attach(file, 'slides', { lessonId });

  const editor = useNotesEditor(lessonId, lesson?.notes ?? '');
  const cardsEditor = useCardsEditor(CARDS, lessonId);
  const cardImages = useCardImagesEditor(cardsEditor, lessonId);
  const cardView = useCardView();
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
            nav: { axis: 'y' as const, count: cards.length },
            onActivate: (index: number) => {
              const id = cards[index]?.id ?? null;
              cardsEditor.setOpenId(cardsEditor.openId === id ? null : id);
            },
          },
    ].filter((block) => mosaic.isOpen(block.id)),
    arrival: mosaic.isOpen(NOTES)
      ? { block: NOTES, level: 'field' }
      : { block: leaves(mosaic.tree)[0] ?? '', level: 'block' },
    options: (block) => [
      ...mosaic.options(block),
      ...(block === SLIDES
        ? [
            {
              id: 'anexar',
              label: slides ? 'Trocar PDF dos slides' : 'Anexar PDF',
              run: () => pickFile(attachSlides),
            },
            ...(slides
              ? [{ id: 'remover', label: 'Remover slides', run: () => void detach(slides) }]
              : []),
          ]
        : []),
      ...(block === NOTES
        ? [
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
      ...(block === CARDS && cardsEditor.mode === 'novo' ? cardImages.options() : []),
      ...(block === CARDS
        ? [
            {
              id: 'compacto',
              label: cardView.compact ? 'Usar cartão padrão' : 'Usar cartão compacto',
              run: toggleCompact,
            },
            {
              id: 'cor-titulos',
              label: cardView.colorTitles ? 'Desligar cor nos títulos' : 'Ligar cor nos títulos',
              run: toggleColorTitles,
            },
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
    actions: withBarActions({
      ...mosaic.actions,
      ...editorActions(editor, page),
      ...cardFormatActions(inCards, cardsEditor.format, editorActions(editor, page)),
      cardLineSplit: () => cardsEditor.lineActions.cardLineSplit(),
      cardLineBack: () => cardsEditor.lineActions.cardLineBack(),
      cardSide: (change) => {
        if (change.type === 'cardSide') cardsEditor.lineActions.cardSide(change.to);
      },
      cardImageRemove: () => cardImages.removeAt(cardsEditor.line),
      cardImageZoom: () => cardImages.zoomAt(cardsEditor.line),
      cardLineMove: (change) => {
        if (change.type === 'cardLineMove') cardsEditor.lineActions.cardLineMove(change.delta);
      },
      // Na tabela, Alt R é o modo Ajustar; fora dela, o redimensionar do mosaico.
      resizeMode: (change) =>
        editorActions(editor, page).resizeMode?.(change) === false
          ? mosaic.actions.resizeMode?.(change)
          : true,
      // Esc fecha o cartão aberto na lista de salvos antes de subir de nível.
      escape: (change) => {
        if (!inCards() || cardsEditor.mode !== 'salvos' || cardsEditor.openId === null)
          return mosaic.actions.escape ? mosaic.actions.escape(change) : false;
        cardsEditor.setOpenId(null);
      },
      cloze: () => {
        if (!inCards()) return false;
        cardsEditor.cloze(false);
      },
      clozeSame: () => {
        if (!inCards()) return false;
        cardsEditor.cloze(true);
      },
      saveCards: () => {
        if (!inCards()) return false;
        cardsEditor.save();
      },
      // Na Mesa, o único item novo é o cartão: Alt N cria de qualquer bloco, sem largar a aula.
      newItem: () => {
        if (!mosaic.isOpen(CARDS)) mosaic.toggle(CARDS);
        cardsEditor.newCard();
      },
      // Nas Anotações, a barra de formatação fica no topo: Alt T e Alt B vão a ela.
      goToTopBar: () => focusBar(getKeyboardState().focus.block, 'top'),
      goToBottomBar: () =>
        focusBar(getKeyboardState().focus.block, inNotes() ? 'top' : 'bottom'),
      previousControl: () => stepBar(-1),
      nextControl: () => stepBar(1),
      changePage: (change) => {
        if (change.type !== 'changePage') return false;
        setPage(clampPage(page + change.step, pages));
      },
    }),
  });

  function render(id: string) {
    if (id === SLIDES) {
      return (
        <Block
          id={id}
          title="Slides"
          icon="slides"
          count={slides ? `${page} de ${pages}` : undefined}
          shortcut="Alt S"
          menu
        >
          <div
            className={`${styles.zona} ${dropping ? styles.soltar : ''}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDropping(true);
            }}
            onDragLeave={() => setDropping(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDropping(false);
              const file = event.dataTransfer.files[0];
              if (file) attachSlides(file);
            }}
          >
            {slides ? (
              <SlidesViewer file={slides} page={page} />
            ) : (
              <div className={styles.vazio}>
                <p>Esta aula ainda não tem slides.</p>
                <Button onPress={() => pickFile(attachSlides)}>Anexar PDF</Button>
              </div>
            )}
          </div>
        </Block>
      );
    }
    if (id === NOTES) {
      return <NotesBlock id={id} editor={editor} />;
    }
    return <CardsBlock id={id} cards={cards} editor={cardsEditor} images={cardImages} />;
  }

  return (
    <ScreenFrame
      title={lesson?.title}
      caps={false}
      level={!mosaic.resizing}
      lead={subject && <SubjectPill code={subject.code} color={subject.color} />}
      end={
        <>
          {mosaic.resizing ? (
            <ModeIndicator
              name="Redimensionar"
              keys={['← → ↑ ↓ ajustam', 'Enter termina']}
              onDone={() => dispatch({ type: 'escape' })}
            />
          ) : (
            <ToggleGroup label="Blocos">
              {TOGGLES.map(({ id, label, letter, icon }) => (
                <BlockToggle
                  key={id}
                  name={label}
                  letter={letter}
                  icon={<BlockIcon name={icon} />}
                  open={mosaic.isOpen(id)}
                  onToggle={() => mosaic.toggle(id)}
                />
              ))}
            </ToggleGroup>
          )}
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
    </ScreenFrame>
  );
}
