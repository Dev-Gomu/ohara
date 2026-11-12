import {
  bimesterValue,
  fromPoints,
  itemMax,
  neededInFourthForYear,
  semesterResult,
  yearResult,
  type Bimester,
  type Item,
} from '../../core/grades/grades';
import type { StudyData, Subject } from '../../core/study/types';
import { Block } from '../components/Block';
import { Button } from '../components/Button';
import { FilterChip } from '../components/Filter';
import {
  AvalRow,
  BimesterTile,
  BoletimHeader,
  BoletimRow,
  GoalIsland,
  NeedLines,
  NeedView,
  SemesterFaixa,
  Soft,
  StatusPill,
  SummaryLines,
  cx,
  fmt,
  Of,
} from '../components/Grades';
import { useSelectedIndex } from '../components/NavItem';
import { dispatch, getKeyboardState, type BlockOption } from '../keyboard/store';
import { useBlocks } from '../keyboard/useBlocks';
import { closeNotes } from '../study/navigation';
import {
  askChangePass,
  askCopyScheme,
  askFromAgenda,
  askItem,
  askPin,
  askScheme,
  deleteItem,
  dropPin,
} from './forms';
import { boletimRow, needCell, subjectItems, sumNote, tileOf } from './model';
import { lock, readPin, saveScheme, schemeFor } from './session';

const REGUA = 'notas.regua';
const BOLETIM = 'notas.boletim';
const FAIXAS = 'notas.faixas';
const AVALS = 'notas.avaliacoes';
const RESUMO = 'notas.resumo';

export function subjectsOf(data: StudyData): Subject[] {
  const years = new Set(data.years.filter((year) => !year.archived).map((year) => year.id));
  return data.subjects.filter((subject) => years.has(subject.yearId));
}

interface Props {
  data: StudyData;
  items: readonly Item[];
  unreadable: number;
}

export function NotasAberto({ data, items, unreadable }: Props) {
  const subjects = subjectsOf(data);
  const picked = useSelectedIndex(REGUA, subjects.length + 1);
  const subject = picked === 0 ? undefined : subjects[picked - 1];
  const warning = unreadable > 0 && (
    <StatusPill kind="atencao">{`${unreadable} registro(s) não abriram`}</StatusPill>
  );

  return (
    <div className={cx('nb-tela')} data-v={subject ? 'materia' : 'geral'}>
      <Block id={REGUA}>
        <div className={cx('nb-regua')}>
          <FilterChip nav={{ block: REGUA, index: 0 }} selected={picked === 0}>
            Boletim geral
          </FilterChip>
          {subjects.map((entry, index) => (
            <FilterChip
              key={entry.id}
              nav={{ block: REGUA, index: index + 1 }}
              subject={entry.color}
              selected={picked === index + 1}
            >
              {`${entry.code}  ${fmt(
                yearResult(
                  subjectItems(items, entry.id),
                  schemeFor(entry.id),
                ).value,
              )}`}
            </FilterChip>
          ))}
        </div>
      </Block>
      {subject ? (
        <Disciplina data={data} items={items} subject={subject} subjects={subjects} warning={warning} />
      ) : (
        <Geral data={data} items={items} subjects={subjects} warning={warning} />
      )}
    </div>
  );
}

function reguaBlock(subjectCount: number, body: string) {
  return {
    id: REGUA,
    kind: 'nav' as const,
    nav: { axis: 'x' as const, count: subjectCount + 1 },
    neighbors: { down: body },
    resets: [FAIXAS, AVALS],
    enterGoesTo: body,
  };
}

interface GeralProps {
  data: StudyData;
  items: readonly Item[];
  subjects: Subject[];
  warning: React.ReactNode;
}

function Geral({ items, subjects, warning }: GeralProps) {
  const rows = subjects.map((subject) =>
    boletimRow(subject, subjectItems(items, subject.id), schemeFor(subject.id)),
  );
  useBlocks({
    blocks: [
      reguaBlock(subjects.length, BOLETIM),
      {
        id: BOLETIM,
        kind: 'nav',
        nav: { axis: 'y', count: rows.length },
        neighbors: { up: REGUA },
        onActivate: (index) =>
          dispatch({ type: 'jump', block: REGUA, level: 'nav', items: { [REGUA]: index + 1 } }),
      },
    ],
    arrival: { block: REGUA, level: 'nav', items: { [REGUA]: 0 } },
    back: closeNotes,
    options: () => [{ id: 'travar', label: 'Travar as Notas agora', run: lock }],
  });

  return (
    <Block id={BOLETIM} title="Boletim geral" count={`${rows.length} matérias`} tools={warning}>
      {rows.length === 0 ? (
        <p className={cx('nt-aviso')}>
          Ainda não há matérias neste ano. Crie uma matéria no Acervo e as notas aparecem aqui.
        </p>
      ) : (
        <div className={cx('nt-rola')}>
          <div className={cx('nc-boletim')} data-v="c">
            <BoletimHeader />
            {rows.map((row, index) => (
              <BoletimRow
                key={row.code}
                row={row}
                block={BOLETIM}
                index={index}
                onOpen={() =>
                  dispatch({
                    type: 'jump',
                    block: REGUA,
                    level: 'nav',
                    items: { [REGUA]: index + 1 },
                  })
                }
              />
            ))}
          </div>
          <p className={cx('nb-apoio')}>
            Tudo de 0 a 10. Enter abre a disciplina; pesos e pontos ficam lá dentro.
          </p>
        </div>
      )}
    </Block>
  );
}

interface DisciplinaProps extends GeralProps {
  subject: Subject;
}

function Disciplina({ data, items, subject, subjects, warning }: DisciplinaProps) {
  const mine = subjectItems(items, subject.id);
  const scheme = schemeFor(subject.id);
  const focusedBimester = (useSelectedIndex(FAIXAS, 4) + 1) as Bimester;
  const inBimester = mine.filter((item) => item.bimester === focusedBimester);
  const rowIndex = useSelectedIndex(AVALS, inBimester.length);
  const item = inBimester[rowIndex];
  const tiles = [1, 2, 3, 4].map((b) => tileOf(mine, scheme, b as Bimester));
  const sem1 = semesterResult(mine, scheme, 1);
  const sem2 = semesterResult(mine, scheme, 2);
  const year = yearResult(mine, scheme);
  const worth = bimesterValue(scheme, focusedBimester);
  const inItems = () => getKeyboardState().focus.block === AVALS;

  const setMin = (delta: number) => {
    const next = Math.min(10, Math.max(0, Math.round((scheme.min + delta) * 2) / 2));
    void saveScheme({ ...scheme, min: next });
  };
  const newItem = () => askItem(subject, mine, undefined, { bimester: focusedBimester });
  const options = (): BlockOption[] => [
    { id: 'novo', label: 'Nova avaliação', keys: 'Alt N', run: newItem },
    ...(item && inItems()
      ? [
          { id: 'editar', label: 'Editar avaliação', run: () => askItem(subject, mine, item) },
          { id: 'excluir', label: 'Excluir avaliação', run: () => deleteItem(item) },
        ]
      : []),
    { id: 'agenda', label: 'Trazer da Agenda', run: () => askFromAgenda(data, subject, mine) },
    { id: 'esquema', label: 'Editar esquema de cálculo', run: () => askScheme(subject) },
    {
      id: 'copiar',
      label: 'Copiar esquema de outra matéria',
      run: () => askCopyScheme(subject, subjects.filter((other) => other.id !== subject.id)),
    },
    { id: 'frase', label: 'Trocar a frase de acesso', run: askChangePass },
    { id: 'pin', label: readPin() ? 'Trocar o PIN' : 'Criar um PIN neste aparelho', run: askPin },
    ...(readPin() ? [{ id: 'sem-pin', label: 'Apagar o PIN', run: dropPin }] : []),
    { id: 'travar', label: 'Travar as Notas agora', run: lock },
  ];

  useBlocks({
    blocks: [
      reguaBlock(subjects.length, FAIXAS),
      {
        id: FAIXAS,
        kind: 'nav',
        nav: { axis: 'x', count: 4 },
        neighbors: { up: REGUA, down: AVALS },
        resets: [AVALS],
        enterGoesTo: AVALS,
      },
      {
        id: AVALS,
        kind: 'nav',
        nav: { axis: 'y', count: inBimester.length },
        neighbors: { up: FAIXAS, right: RESUMO },
        onActivate: () => item && askItem(subject, mine, item),
      },
      {
        id: RESUMO,
        kind: 'nav',
        nav: { axis: 'x', count: 2 },
        neighbors: { left: AVALS },
        onActivate: (index) => setMin(index === 0 ? -0.5 : 0.5),
      },
    ],
    arrival: { block: REGUA, level: 'nav', items: { [REGUA]: 0 } },
    back: closeNotes,
    options,
    actions: { newItem },
  });

  const fourth = tiles[3];
  const need = neededInFourthForYear(mine, scheme);
  const needLines: [string, React.ReactNode][] = [
    ['Precisa no 4º bim.', <NeedView key="n" need={needCell(mine, scheme)} />],
  ];
  const needValue = needCell(mine, scheme);
  if (typeof needValue === 'number' && fourth) {
    const points = (needValue * fourth.worth) / 10;
    needLines[0] = [
      'Precisa no 4º bim.',
      <span key="n" className={cx('nc-par')}>
        <b>{fmt(points)}</b> <Of value={fourth.worth} />
      </span>,
    ];
    if (fourth.convert) {
      needLines.push(['Nota nas avaliações', <b key="g">{fmt(fromPoints(points, fourth.worth))}</b>]);
    }
  }
  void need;

  return (
    <div className={cx('nt-m1')}>
      <Block
        id={FAIXAS}
        title={subject.name}
        count={`esquema ${fmt(bimesterValue(scheme, 1))} + ${fmt(bimesterValue(scheme, 2))}`}
        tools={warning}
        menu
      >
        <div className={cx('nt-faixas')}>
          {[1, 2].map((half) => (
            <SemesterFaixa
              key={half}
              label={`${half}º semestre`}
              total={(half === 1 ? sem1 : sem2).partial ? null : (half === 1 ? sem1 : sem2).value}
            >
              {[0, 1].map((k) => {
                const index = (half - 1) * 2 + k;
                const tile = tiles[index];
                return tile && <BimesterTile key={index} tile={tile} block={FAIXAS} index={index} />;
              })}
            </SemesterFaixa>
          ))}
        </div>
      </Block>
      <Block
        id={AVALS}
        title={`Avaliações do ${focusedBimester}º bim.`}
        count={`${inBimester.length} · vale ${fmt(worth)}`}
        shortcut="Alt N"
        tools={
          <>
            {sumNote(inBimester, worth) && <Soft>{sumNote(inBimester, worth)}</Soft>}
            <Button variant="primary" onPress={newItem}>
              Nova avaliação
            </Button>
          </>
        }
        menu
      >
        <div className={cx('nt-lista')}>
          {inBimester.length === 0 && (
            <p className={cx('nb-apoio')}>
              Nenhuma avaliação neste bimestre. Alt N cria uma; o ⋮ traz as provas da Agenda.
            </p>
          )}
          {inBimester.map((entry, index) => (
            <AvalRow
              key={entry.id}
              name={`${entry.name}${entry.replaces ? ' (reposição)' : ''}`}
              note=""
              grade={entry.grade}
              max={itemMax(entry)}
              low={entry.grade !== null && (entry.grade / itemMax(entry)) * 10 < scheme.min}
              block={AVALS}
              index={index}
              onOpen={() => askItem(subject, mine, entry)}
            />
          ))}
        </div>
      </Block>
      <div className={cx('nt-lado')}>
        <Block id={RESUMO} title="Resumo">
          <div className={cx('nt-pad')}>
            <SummaryLines
              lines={[
                ['1º semestre', sem1.value === null || sem1.partial ? <Soft key="a">em aberto</Soft> : fmt(sem1.value)],
                ['2º semestre', sem2.value === null || sem2.partial ? <Soft key="b">em aberto</Soft> : fmt(sem2.value)],
                ['Média até agora', fmt(year.value)],
              ]}
            >
              <GoalIsland value={scheme.min} block={RESUMO} onStep={setMin} />
            </SummaryLines>
          </div>
        </Block>
        <Block id="notas.preciso" title="Quanto preciso tirar">
          <div className={cx('nt-pad')}>
            <NeedLines lines={needLines} />
          </div>
        </Block>
      </div>
    </div>
  );
}
