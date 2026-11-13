import { addFolder, addLesson } from '../../../core/study/create';
import { shortDate } from '../../../core/study/dates';
import {
  cardCount,
  filterLessons,
  folderName,
  folderTabs,
  initialTabIndex,
  lessonsOf,
  notesExcerpt,
  NO_FOLDER,
  ALL_FOLDERS,
  subjectOf,
} from '../../../core/study/queries';
import { Block } from '../../components/Block';
import { Button } from '../../components/Button';
import { ListItem } from '../../components/ListItem';
import { useNavCursor, useSelectedIndex } from '../../components/NavItem';
import { Preview } from '../../components/Preview';
import { Ruler } from '../../components/Ruler';
import { BlockTab, BlockTabs } from '../../components/Toggles';
import { dispatch, getKeyboardState } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { ask } from '../../shell/PromptWindow';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { openLesson } from '../../study/navigation';
import { useScreenMemory } from '../../study/screenMemory';
import { cardOptions, folderOptions, lessonOptions } from '../../study/editOptions';
import { storage, today, useStudy } from '../../study/study';
import styles from './Acervo.module.css';

const FOLDERS = 'acervo.pastas';
const LESSONS = 'acervo.aulas';
const PREVIEW = 'acervo.previa';

interface SubjectViewProps {
  subjectId: string;
  onBack: () => void;
}

function askFolder(subjectId: string) {
  ask({
    title: 'Nova pasta',
    action: 'Criar',
    fields: [{ id: 'name', label: 'Nome' }],
    onSubmit: ({ name }) => {
      if (name) storage.write((data) => addFolder(data, crypto.randomUUID(), subjectId, name));
    },
  });
}

function askLesson(subjectId: string, folderId: string | null) {
  ask({
    title: 'Nova aula',
    action: 'Criar',
    fields: [
      { id: 'title', label: 'Título' },
      { id: 'date', label: 'Data', type: 'date', value: today },
    ],
    onSubmit: ({ title, date }) => {
      if (!title || !date) return;
      const id = crypto.randomUUID();
      storage.write((data) => addLesson(data, id, subjectId, folderId, title, date));
    },
  });
}

const folderDetail = (count: number) =>
  count === 0 ? 'vazia' : `${count} ${count === 1 ? 'aula' : 'aulas'}`;
const cardsLabel = (count: number) => (count === 0 ? 'sem cartões' : `${count} cartões`);

export function SubjectView({ subjectId, onBack }: SubjectViewProps) {
  const data = useStudy();
  const [mode, setMode] = useScreenMemory<'aulas' | 'cartoes'>('acervo.modo', 'aulas');
  const subject = subjectOf(data, subjectId);
  const tabs = folderTabs(data, subjectId);
  const tabIndex = useSelectedIndex(FOLDERS, tabs.length);
  const tab = tabs[tabIndex]?.id ?? ALL_FOLDERS;
  const allLessons = lessonsOf(data, subjectId);
  const lessons = filterLessons(allLessons, tab);
  const cards = data.cards.filter((card) => lessons.some((item) => item.id === card.lessonId));
  const showCards = mode === 'cartoes';
  const count = showCards ? cards.length : lessons.length;
  const itemIndex = useSelectedIndex(LESSONS, count);
  const card = showCards ? cards[itemIndex] : undefined;
  const lesson = showCards
    ? lessons.find((item) => item.id === card?.lessonId)
    : lessons[itemIndex];
  const openCursor = useNavCursor(PREVIEW, 0);
  const open = () => {
    if (lesson) openLesson(lesson.id);
  };
  const folderOfTab = tab === ALL_FOLDERS || tab === NO_FOLDER ? null : tab;
  const toggleMode = () => {
    setMode(showCards ? 'aulas' : 'cartoes');
    dispatch({ type: 'jump', block: LESSONS, level: 'nav', items: { [LESSONS]: 0 } });
  };

  useBlocks({
    blocks: [
      {
        id: FOLDERS,
        kind: 'nav',
        nav: { axis: 'x', count: tabs.length },
        neighbors: { down: LESSONS },
        resets: [LESSONS],
        enterGoesTo: LESSONS,
      },
      {
        id: LESSONS,
        kind: 'nav',
        nav: { axis: 'y', count },
        neighbors: { up: FOLDERS, right: PREVIEW },
        onActivate: open,
      },
      {
        id: PREVIEW,
        kind: 'nav',
        nav: { axis: 'y', count: lesson ? 1 : 0 },
        neighbors: { left: LESSONS, up: FOLDERS },
        onActivate: open,
      },
    ],
    arrival: {
      block: FOLDERS,
      level: 'nav',
      items: { [FOLDERS]: initialTabIndex(tabs, data, subjectId), [LESSONS]: 0 },
    },
    back: onBack,
    options: (block) => {
      if (block === FOLDERS) {
        return folderOptions(data.folders.find((item) => item.id === tab));
      }
      if (block === LESSONS) return showCards ? cardOptions(card) : lessonOptions(lesson);
      return [];
    },
    actions: {
      toggleBlock: (change) => {
        if (change.type !== 'toggleBlock' || change.block !== 'cards') return false;
        toggleMode();
      },
      newItem: () => {
        if (getKeyboardState().focus.block === FOLDERS) askFolder(subjectId);
        else askLesson(subjectId, folderOfTab);
      },
      goToField: () => {
        onBack();
        dispatch({ type: 'jump', block: 'acervo.busca', level: 'field' });
      },
    },
  });

  return (
    <ScreenFrame
      title={subject?.name}
      bar={
        <button type="button" className={styles.voltar} onClick={onBack}>
          ← Acervo <kbd className={styles.tecla}>Esc</kbd>
        </button>
      }
      end={
        <>
          <span className={styles.siglaTopo} data-materia={subject?.color}>
            {subject?.code}
          </span>
        </>
      }
    >
      <div className={styles.materiaAberta}>
        <Block id={FOLDERS} className={styles.regua}>
          <Ruler
            block={FOLDERS}
            items={tabs.map((item) => ({
              id: item.id,
              title: item.name,
              detail: folderDetail(item.count),
            }))}
            createLabel="Nova pasta"
            onCreate={() => askFolder(subjectId)}
          />
        </Block>
        <Block
          id={LESSONS}
          title={showCards ? 'Cartões' : 'Aulas'}
          count={String(count)}
          shortcut="Alt N"
          menu
          tools={
            <BlockTabs label="Mostrar">
              <BlockTab selected={!showCards} onPress={() => showCards && toggleMode()}>
                Aulas
              </BlockTab>
              <BlockTab
                selected={showCards}
                count={data.cards.filter((c) => allLessons.some((l) => l.id === c.lessonId)).length}
                onPress={() => !showCards && toggleMode()}
              >
                Cartões
              </BlockTab>
            </BlockTabs>
          }
        >
          <div className={styles.lista}>
            {count === 0 && (
              <p className={styles.vazio}>
                {showCards ? 'Nenhum cartão nesta pasta.' : 'Nenhuma aula nesta pasta.'}
              </p>
            )}
            {!showCards &&
              lessons.map((item, index) => (
                <ListItem
                  key={item.id}
                  nav={{ block: LESSONS, index }}
                  time={shortDate(item.date)}
                  title={item.title}
                  detail={cardsLabel(cardCount(data, item.id))}
                />
              ))}
            {showCards &&
              cards.map((item, index) => (
                <ListItem
                  key={item.id}
                  nav={{ block: LESSONS, index }}
                  title={item.question}
                  detail={item.answer}
                />
              ))}
          </div>
        </Block>
        <Block id={PREVIEW} title="Prévia">
          {lesson ? (
            <Preview
              title={card?.question ?? lesson.title}
              detail={
                card
                  ? `${card.answer} · aula: ${lesson.title}`
                  : `${shortDate(lesson.date)} · ${folderName(data, lesson)} · ${cardsLabel(cardCount(data, lesson.id))}`
              }
              actions={
                <Button variant="primary" shortcut="Enter" cursor={openCursor} onPress={open}>
                  Abrir na Mesa
                </Button>
              }
            >
              <div className={styles.capa} data-materia={subject?.color}>
                <span className={styles.sigla}>{subject?.code}</span>
                <span className={styles.capaIcone}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="12" rx="2" />
                    <path d="M12 16v4M8 20h8" />
                  </svg>
                  sem capa ainda
                </span>
              </div>
              {!card && <p className={styles.trecho}>{notesExcerpt(lesson.notes)}</p>}
            </Preview>
          ) : (
            <p className={styles.vazio}>Escolha uma aula para ver a prévia.</p>
          )}
        </Block>
      </div>
    </ScreenFrame>
  );
}
