import { useEffect } from 'react';
import {
  activeSubjects,
  describeScope,
  dueCards,
  fullScope,
  scopeCards,
  scopeRows,
  togglePick,
  type Scope,
} from '../../../core/study/scope';
import type { StudyData } from '../../../core/study/types';
import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { Ruler } from '../../components/Ruler';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { useScreenMemory } from '../../study/screenMemory';
import { today, useStudy } from '../../study/study';
import styles from './Treino.module.css';

const SUBJECTS = 'treino.materias';
const ROWS = 'treino.escolha';
const SUMMARY = 'treino.resumo';
const ALL = '*';

interface TrainingChoiceProps {
  onStart: (cardIds: string[]) => void;
}

export function TrainingChoice({ onStart }: TrainingChoiceProps) {
  const data = useStudy();
  const [subjectMemory, setSubjectMemory] = useScreenMemory('treino.materia', 0);
  const [picks, setPicks] = useScreenMemory<Record<string, readonly string[]>>(
    'treino.marcadas',
    {},
  );
  const subjects = activeSubjects(data);
  const tabs = [null, ...subjects.map((subject) => subject.id)];
  const tabIndex = useSelectedIndex(SUBJECTS, tabs.length);
  const subjectId = tabs[tabIndex] ?? null;
  const key = subjectId ?? ALL;
  const scope: Scope = { subjectId, picks: picks[key] ?? fullScope(subjectId).picks };
  const rows = scopeRows(data, scope, today);
  const rowIndex = useSelectedIndex(ROWS, rows.length);
  const cards = scopeCards(data, scope);
  const due = dueCards(cards, today);
  const queue = due.length > 0 ? due : cards;

  useEffect(() => setSubjectMemory(tabIndex), [tabIndex, setSubjectMemory]);

  const toggle = (index: number) => {
    const row = rows[index];
    if (row) setPicks({ ...picks, [key]: togglePick(data, scope, row.id).picks });
  };
  const start = () => {
    if (queue.length > 0) onStart(queue.map((card) => card.id));
  };

  useBlocks({
    blocks: [
      {
        id: SUBJECTS,
        kind: 'nav',
        nav: { axis: 'x', count: tabs.length },
        neighbors: { down: ROWS },
        resets: [ROWS],
        enterGoesTo: ROWS,
      },
      {
        id: ROWS,
        kind: 'nav',
        nav: { axis: 'y', count: rows.length },
        neighbors: { up: SUBJECTS, right: SUMMARY },
        onActivate: () => toggle(rowIndex),
      },
      {
        id: SUMMARY,
        kind: 'nav',
        nav: { axis: 'y', count: 1 },
        neighbors: { left: ROWS, up: SUBJECTS },
        onActivate: start,
      },
    ],
    // Quem treina o de sempre só aperta Enter: a escolha fica lembrada.
    arrival: { block: SUMMARY, level: 'nav', items: { [SUBJECTS]: subjectMemory, [ROWS]: 0 } },
  });

  const subjectTabs = [
    { id: ALL, title: 'Todas', detail: countLabel(data, fullScope(null)) },
    ...subjects.map((subject) => ({
      id: subject.id,
      title: subject.code,
      detail: countLabel(data, fullScope(subject.id)),
    })),
  ];

  return (
    <ScreenFrame title="Treino">
      <div className={styles.escolha}>
        <Block id={SUBJECTS} className={styles.regua}>
          <Ruler block={SUBJECTS} items={subjectTabs} />
        </Block>
        <Block id={ROWS} title="O que treinar" count={String(rows.length)}>
          <div className={styles.lista}>
            {rows.length === 1 && rows[0]?.total === 0 && (
              <p className={styles.vazio}>
                Nenhum cartão aqui. Crie cartões no bloco Cartões da Mesa.
              </p>
            )}
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
        <Block id={SUMMARY} title="Resumo">
          <div className={styles.resumo}>
            <span className={styles.numero}>{due.length}</span>
            <p className={styles.legenda}>
              {due.length === 1 ? 'cartão para hoje' : 'cartões para hoje'}, de {cards.length}
              <br />
              <span className={styles.recorte}>{describeScope(data, scope)}</span>
            </p>
            <NavItem
              block={SUMMARY}
              index={0}
              className={styles.iniciar}
              ring="anel"
              onOpen={start}
            >
              {startLabel(due.length, cards.length)}
              <kbd className={styles.teclaBotao}>Enter</kbd>
            </NavItem>
          </div>
        </Block>
      </div>
    </ScreenFrame>
  );
}

function countLabel(data: StudyData, scope: Scope): string {
  const due = dueCards(scopeCards(data, scope), today).length;
  return due > 0 ? `${due} hoje` : 'em dia';
}

// Sem cartão vencido, ainda dá para adiantar: estudar uma aula antes da prova, por exemplo.
function startLabel(due: number, total: number): string {
  if (due > 0) return 'Iniciar treino';
  if (total > 0) return `Adiantar ${total} ${total === 1 ? 'cartão' : 'cartões'}`;
  return 'Nada para treinar';
}
