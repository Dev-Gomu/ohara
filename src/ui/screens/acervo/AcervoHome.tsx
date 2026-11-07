import { shortDate } from '../../../core/study/dates';
import { lessonsOf } from '../../../core/study/queries';
import { addSubject } from '../../../core/study/create';
import { removeSubject, renameSubject } from '../../../core/study/edit';
import { search, type SearchResult } from '../../../core/study/search';
import type { StudyData, Subject } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { Ruler } from '../../components/Ruler';
import { dispatch, getKeyboardState } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { ask } from '../../shell/PromptWindow';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { openLesson } from '../../study/navigation';
import { useScreenMemory } from '../../study/screenMemory';
import { removeWithUndo } from '../../study/undo';
import { storage, useStudy } from '../../study/study';
import styles from './Acervo.module.css';

const YEARS = 'acervo.anos';
const SEARCH = 'acervo.busca';
const SUBJECTS = 'acervo.materias';
const RESULTS = 'acervo.resultados';
const COLUMNS = 4;

interface CardProps {
  data: StudyData;
  subject: Subject;
  index: number;
  onOpen: (id: string) => void;
}

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

function askSubject(yearId: string) {
  ask({
    title: 'Nova matéria',
    action: 'Criar',
    fields: [{ id: 'name', label: 'Nome' }],
    onSubmit: ({ name }) => {
      if (name) storage.write((data) => addSubject(data, crypto.randomUUID(), yearId, name));
    },
  });
}

function subjectOptions(subject: Subject | undefined) {
  if (!subject) return [];
  return [
    {
      id: 'renomear',
      label: 'Renomear matéria',
      run: () =>
        ask({
          title: 'Renomear matéria',
          action: 'Salvar',
          fields: [{ id: 'name', label: 'Nome', value: subject.name }],
          onSubmit: ({ name }) => {
            if (name) storage.write((data) => renameSubject(data, subject.id, name.trim()));
          },
        }),
    },
    {
      id: 'excluir',
      label: 'Excluir matéria',
      run: () =>
        removeWithUndo(`Matéria "${subject.name}" excluída.`, (data) =>
          removeSubject(data, subject.id),
        ),
    },
  ];
}

export function AcervoHome({ onOpen }: { onOpen: (id: string) => void }) {
  const data = useStudy();
  const [query, setQuery] = useScreenMemory('acervo.termo', '');
  const current = data.years.findIndex((year) => !year.archived);
  const yearIndex = useSelectedIndex(YEARS, data.years.length);
  const chosen = getKeyboardState().focus.items[YEARS] === undefined ? current : yearIndex;
  const year = data.years[chosen];
  const subjects = data.subjects.filter((subject) => subject.yearId === year?.id);
  const results = search(data, query);
  const searching = query.trim() !== '';
  const content = searching ? RESULTS : SUBJECTS;

  function openResult(result: SearchResult | undefined) {
    if (result?.kind === 'materia') onOpen(result.target);
    else if (result) openLesson(result.target);
  }

  const newSubject = () => {
    if (year && !year.archived) askSubject(year.id);
  };

  useBlocks({
    blocks: [
      {
        id: YEARS,
        kind: 'nav',
        nav: { axis: 'x', count: data.years.length },
        neighbors: { down: content, right: SEARCH },
        resets: [SUBJECTS],
        enterGoesTo: content,
      },
      { id: SEARCH, kind: 'text', neighbors: { left: YEARS, down: content } },
      searching
        ? {
            id: RESULTS,
            kind: 'nav',
            nav: { axis: 'y', count: results.length },
            neighbors: { up: SEARCH },
            onActivate: (index) => openResult(results[index]),
          }
        : {
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
    arrival: { block: content, level: 'nav', items: { [YEARS]: chosen } },
    options: (block) =>
      block === SUBJECTS
        ? subjectOptions(subjects[getKeyboardState().focus.items[SUBJECTS] ?? 0])
        : [],
    actions: {
      newItem: newSubject,
      goToField: () => dispatch({ type: 'jump', block: SEARCH, level: 'field' }),
    },
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
            createLabel={year?.archived ? undefined : 'Nova matéria'}
            onCreate={newSubject}
          />
        </Block>
        <Block id={SEARCH}>
          <form
            className={styles.busca}
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              if (results.length > 0) {
                dispatch({ type: 'jump', block: RESULTS, level: 'nav', items: { [RESULTS]: 0 } });
              }
            }}
          >
            <input
              className={styles.buscaCampo}
              data-field
              aria-label="Buscar"
              placeholder="Buscar matéria, aula ou cartão"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd className={styles.tecla}>Alt F</kbd>
          </form>
        </Block>
        {searching ? (
          <Block
            id={RESULTS}
            title="Resultados"
            count={String(results.length)}
            className={styles.largo}
          >
            <div className={styles.lista}>
              {results.length === 0 && <p className={styles.vazio}>Nada encontrado.</p>}
              {results.map((result, index) => (
                <NavItem
                  key={`${result.kind}-${result.id}`}
                  block={RESULTS}
                  index={index}
                  className={styles.aula}
                  onOpen={() => openResult(result)}
                >
                  <b className={styles.aulaNome}>{result.title}</b>
                  <span className={styles.aulaDados}>{result.detail}</span>
                </NavItem>
              ))}
            </div>
          </Block>
        ) : (
          <Block
            id={SUBJECTS}
            label="Matérias"
            menu
            className={`${styles.semFundo} ${styles.largo}`}
          >
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
        )}
      </div>
    </ScreenFrame>
  );
}
