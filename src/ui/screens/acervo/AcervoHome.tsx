import { shortDate } from '../../../core/study/dates';
import type { StudyData, Subject } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { Ruler } from '../../components/Ruler';
import { getKeyboardState } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { useStudy } from '../../study/study';
import { lessonsOf } from '../../../core/study/queries';
import styles from './Acervo.module.css';

const YEARS = 'acervo.anos';
const SUBJECTS = 'acervo.materias';
const COLUMNS = 4;

function SubjectCard({ data, subject, index, onOpen }: CardProps) {
  const lessons = lessonsOf(data, subject.id).length;
  return (
    <NavItem
      block={SUBJECTS}
      index={index}
      className={styles.materia}
      ring="anel"
      onOpen={() => onOpen(subject.id)}
    >
      <span className={styles.materiaCorpo} data-materia={subject.color} data-vazia={lessons === 0}>
        <span className={styles.sigla}>{subject.code}</span>
        <span className={styles.total}>
          {lessons} <small>{lessons === 1 ? 'aula' : 'aulas'}</small>
        </span>
        <b className={styles.materiaNome}>{subject.name}</b>
        <span className={styles.acesso}>
          {subject.lastAccess === null
            ? 'Nenhuma aula ainda'
            : `Último acesso: ${shortDate(subject.lastAccess)}`}
        </span>
      </span>
    </NavItem>
  );
}

interface CardProps {
  data: StudyData;
  subject: Subject;
  index: number;
  onOpen: (id: string) => void;
}

export function AcervoHome({ onOpen }: { onOpen: (id: string) => void }) {
  const data = useStudy();
  const current = data.years.findIndex((year) => !year.archived);
  const yearIndex = useSelectedIndex(YEARS, data.years.length);
  const chosen = getKeyboardState().focus.items[YEARS] === undefined ? current : yearIndex;
  const year = data.years[chosen];
  const subjects = data.subjects.filter((subject) => subject.yearId === year?.id);

  useBlocks({
    blocks: [
      {
        id: YEARS,
        kind: 'nav',
        nav: { axis: 'x', count: data.years.length },
        neighbors: { down: SUBJECTS },
        resets: [SUBJECTS],
        enterGoesTo: SUBJECTS,
      },
      {
        id: SUBJECTS,
        kind: 'nav',
        nav: { axis: 'grid', count: subjects.length, columns: COLUMNS },
        neighbors: { up: YEARS },
        onActivate: (index) => {
          const subject = subjects[index];
          if (subject) onOpen(subject.id);
        },
      },
    ],
    arrival: { block: SUBJECTS, level: 'nav', items: { [YEARS]: chosen } },
  });

  return (
    <ScreenFrame title="Acervo">
      <div className={styles.inicio}>
        <Block id={YEARS}>
          <Ruler
            block={YEARS}
            items={data.years.map((item) => ({
              id: item.id,
              title: item.name,
              detail: item.archived
                ? 'arquivado · só consulta'
                : `${data.subjects.filter((one) => one.yearId === item.id).length} matérias`,
            }))}
          />
        </Block>
        <Block id={SUBJECTS} className={styles.semFundo}>
          <div className={styles.grade}>
            {subjects.length === 0 && <p className={styles.vazio}>Nenhuma matéria neste ano.</p>}
            {subjects.map((subject, index) => (
              <SubjectCard
                key={subject.id}
                data={data}
                subject={subject}
                index={index}
                onOpen={onOpen}
              />
            ))}
          </div>
        </Block>
      </div>
    </ScreenFrame>
  );
}
