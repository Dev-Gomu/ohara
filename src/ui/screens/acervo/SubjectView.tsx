import { addFolder, addLesson } from '../../../core/study/create';
import { shortDate } from '../../../core/study/dates';
import {
  cardCount,
  filterLessons,
  folderName,
  folderTabs,
  initialTabIndex,
  lessonsOf,
  NO_FOLDER,
  ALL_FOLDERS,
  subjectOf,
} from '../../../core/study/queries';
import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { Ruler } from '../../components/Ruler';
import { dispatch, getKeyboardState } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { ask } from '../../shell/PromptWindow';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { openLesson } from '../../study/navigation';
import { useScreenMemory } from '../../study/screenMemory';
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

export function SubjectView({ subjectId, onBack }: SubjectViewProps) {
  const data = useStudy();
  const [mode, setMode] = useScreenMemory<'aulas' | 'cartoes'>('acervo.modo', 'aulas');
  const subject = subjectOf(data, subjectId);
  const tabs = folderTabs(data, subjectId);
  const tabIndex = useSelectedIndex(FOLDERS, tabs.length);
  const tab = tabs[tabIndex]?.id ?? ALL_FOLDERS;
  const lessons = filterLessons(lessonsOf(data, subjectId), tab);
  const cards = data.cards.filter((card) => lessons.some((item) => item.id === card.lessonId));
  const showCards = mode === 'cartoes';
  const count = showCards ? cards.length : lessons.length;
  const itemIndex = useSelectedIndex(LESSONS, count);
  const card = showCards ? cards[itemIndex] : undefined;
  const lesson = showCards
    ? lessons.find((item) => item.id === card?.lessonId)
    : lessons[itemIndex];
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
          <button type="button" className={styles.modo} data-sel={showCards} onClick={toggleMode}>
            Cartões <kbd className={styles.tecla}>Alt C</kbd>
          </button>
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
              detail: `${item.count} ${item.count === 1 ? 'aula' : 'aulas'}`,
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
        >
          <div className={styles.lista}>
            {count === 0 && (
              <p className={styles.vazio}>
                {showCards ? 'Nenhum cartão nesta pasta.' : 'Nenhuma aula nesta pasta.'}
              </p>
            )}
            {!showCards &&
              lessons.map((item, index) => (
                <NavItem key={item.id} block={LESSONS} index={index} className={styles.aula}>
                  <b className={styles.aulaNome}>{item.title}</b>
                  <span className={styles.aulaDados}>
                    {shortDate(item.date)} · {folderName(data, item)}
                  </span>
                  <span className={styles.aulaCartoes}>{cardCount(data, item.id)} cartões</span>
                </NavItem>
              ))}
            {showCards &&
              cards.map((item, index) => (
                <NavItem key={item.id} block={LESSONS} index={index} className={styles.aula}>
                  <b className={styles.aulaNome}>{item.question}</b>
                  <span className={styles.aulaDados}>{item.answer}</span>
                </NavItem>
              ))}
          </div>
        </Block>
        <Block id={PREVIEW} title="Prévia">
          {lesson ? (
            <div className={styles.previa}>
              <div className={styles.capa} data-materia={subject?.color}>
                <span className={styles.sigla}>{subject?.code}</span>
              </div>
              <h2 className={styles.previaTitulo}>{card?.question ?? lesson.title}</h2>
              <p className={styles.aulaDados}>
                {card
                  ? `${card.answer} · aula: ${lesson.title}`
                  : `${shortDate(lesson.date)} · ${folderName(data, lesson)} · ${lesson.slides} slides · ${cardCount(data, lesson.id)} cartões`}
              </p>
              <NavItem block={PREVIEW} index={0} className={styles.abrir} ring="anel" onOpen={open}>
                Abrir na Mesa <kbd className={styles.teclaAbrir}>Enter</kbd>
              </NavItem>
            </div>
          ) : (
            <p className={styles.vazio}>Escolha uma aula para ver a prévia.</p>
          )}
        </Block>
      </div>
    </ScreenFrame>
  );
}
