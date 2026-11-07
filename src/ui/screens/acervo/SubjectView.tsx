import { shortDate } from '../../../core/study/dates';
import {
  cardCount,
  filterLessons,
  folderName,
  folderTabs,
  initialTabIndex,
  lessonsOf,
  subjectOf,
} from '../../../core/study/queries';
import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { Ruler } from '../../components/Ruler';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { openLesson } from '../../study/navigation';
import { useStudy } from '../../study/study';
import styles from './Acervo.module.css';

const FOLDERS = 'acervo.pastas';
const LESSONS = 'acervo.aulas';
const PREVIEW = 'acervo.previa';

interface SubjectViewProps {
  subjectId: string;
  onBack: () => void;
}

export function SubjectView({ subjectId, onBack }: SubjectViewProps) {
  const data = useStudy();
  const subject = subjectOf(data, subjectId);
  const tabs = folderTabs(data, subjectId);
  const tabIndex = useSelectedIndex(FOLDERS, tabs.length);
  const lessons = filterLessons(lessonsOf(data, subjectId), tabs[tabIndex]?.id ?? '');
  const lessonIndex = useSelectedIndex(LESSONS, lessons.length);
  const lesson = lessons[lessonIndex];

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
        nav: { axis: 'y', count: lessons.length },
        neighbors: { up: FOLDERS, right: PREVIEW },
        onActivate: (index) => {
          const item = lessons[index];
          if (item) openLesson(item.id);
        },
      },
      {
        id: PREVIEW,
        kind: 'nav',
        nav: { axis: 'y', count: lesson ? 1 : 0 },
        neighbors: { left: LESSONS, up: FOLDERS },
        onActivate: () => {
          if (lesson) openLesson(lesson.id);
        },
      },
    ],
    arrival: {
      block: FOLDERS,
      level: 'nav',
      items: { [FOLDERS]: initialTabIndex(tabs, data, subjectId), [LESSONS]: 0 },
    },
    back: onBack,
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
        <span className={styles.siglaTopo} data-materia={subject?.color}>
          {subject?.code}
        </span>
      }
    >
      <div className={styles.materiaAberta}>
        <Block id={FOLDERS} className={styles.regua}>
          <Ruler
            block={FOLDERS}
            items={tabs.map((tab) => ({
              id: tab.id,
              title: tab.name,
              detail: `${tab.count} ${tab.count === 1 ? 'aula' : 'aulas'}`,
            }))}
            createLabel="Nova pasta"
          />
        </Block>
        <Block id={LESSONS} title="Aulas" count={String(lessons.length)}>
          <div className={styles.lista}>
            {lessons.length === 0 && <p className={styles.vazio}>Nenhuma aula nesta pasta.</p>}
            {lessons.map((item, index) => (
              <NavItem key={item.id} block={LESSONS} index={index} className={styles.aula}>
                <b className={styles.aulaNome}>{item.title}</b>
                <span className={styles.aulaDados}>
                  {shortDate(item.date)} · {folderName(data, item)}
                </span>
                <span className={styles.aulaCartoes}>{cardCount(data, item.id)} cartões</span>
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
              <h2 className={styles.previaTitulo}>{lesson.title}</h2>
              <p className={styles.aulaDados}>
                {shortDate(lesson.date)} · {folderName(data, lesson)} · {lesson.slides} slides ·{' '}
                {cardCount(data, lesson.id)} cartões
              </p>
              <NavItem
                block={PREVIEW}
                index={0}
                className={styles.abrir}
                ring="anel"
                onOpen={() => openLesson(lesson.id)}
              >
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
