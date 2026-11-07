import { useEffect } from 'react';
import {
  bimesterResult,
  BIMESTERS,
  formatGrade,
  neededInSecondSemester,
  semesterResult,
  statusOf,
  yearResult,
  type Item,
  type Result,
  type Status,
} from '../../core/grades/grades';
import type { StudyData, Subject } from '../../core/study/types';
import { Block } from '../components/Block';
import { NavItem, useSelectedIndex } from '../components/NavItem';
import { Ruler, type RulerItem } from '../components/Ruler';
import { getKeyboardState, type BlockOption } from '../keyboard/store';
import { useBlocks } from '../keyboard/useBlocks';
import { ScreenFrame } from '../shell/ScreenFrame';
import { AGENDA_VIEWS } from '../study/navigation';
import { useStudy } from '../study/study';
import {
  askChangePass,
  askCopyScheme,
  askFromAgenda,
  askItem,
  askPin,
  askPinUnlock,
  askRecover,
  askScheme,
  askSetup,
  askUnlock,
  deleteItem,
  dropPin,
} from './forms';
import styles from './Notas.module.css';
import { cancelDraft, confirmDraft, lock, readPin, schemeFor, useSecretView } from './session';

const VAULT = 'notas.cofre';
const SUBJECTS = 'notas.materias';
const ITEMS = 'notas.itens';
const SUMMARY = 'notas.resumo';

const STATUS: Record<Status, string> = {
  'sem-notas': 'sem notas',
  'em-andamento': 'em andamento',
  aprovado: 'aprovado',
  abaixo: 'abaixo do mínimo',
};

function show(result: Result): string {
  return result.value === null
    ? '—'
    : `${formatGrade(result.value)}${result.partial ? ' (parcial)' : ''}`;
}

interface Action {
  label: string;
  hint?: string;
  run: () => void;
}

function vaultActions(hasVault: boolean, draftCode: string | null): Action[] {
  if (draftCode) {
    return [
      { label: 'Anotei o código, continuar', hint: 'Enter', run: () => void confirmDraft() },
      { label: 'Cancelar', run: cancelDraft },
    ];
  }
  if (!hasVault) return [{ label: 'Criar a frase de acesso', hint: 'Enter', run: askSetup }];
  return [
    { label: 'Abrir com a frase', hint: 'Enter', run: askUnlock },
    ...(readPin() ? [{ label: 'Abrir com o PIN', run: askPinUnlock }] : []),
    { label: 'Esqueci a frase: usar o código de recuperação', run: askRecover },
  ];
}

export function Notas({ rulerItems }: { rulerItems: readonly RulerItem[] }) {
  const secret = useSecretView();
  const data = useStudy();
  const open = secret.key !== null;
  const hasVault = data.vault.length > 0;

  // D41: sair da tela de Notas trava na hora.
  useEffect(() => lock, []);

  return (
    <ScreenFrame title="Agenda">
      {open ? (
        <Open
          data={data}
          items={secret.items}
          unreadable={secret.unreadable}
          rulerItems={rulerItems}
        />
      ) : (
        <Closed hasVault={hasVault} code={secret.draft?.code ?? null} rulerItems={rulerItems} />
      )}
    </ScreenFrame>
  );
}

function RulerBlock({ rulerItems }: { rulerItems: readonly RulerItem[] }) {
  return (
    <Block id={AGENDA_VIEWS} className={styles.regua}>
      <Ruler block={AGENDA_VIEWS} items={rulerItems} />
    </Block>
  );
}

function Closed(props: {
  hasVault: boolean;
  code: string | null;
  rulerItems: readonly RulerItem[];
}) {
  const { hasVault, code, rulerItems } = props;
  const actions = vaultActions(hasVault, code);
  useBlocks({
    blocks: [
      {
        id: AGENDA_VIEWS,
        kind: 'nav',
        nav: { axis: 'x', count: 5 },
        neighbors: { down: VAULT },
        enterGoesTo: VAULT,
        enterKeepsItem: true,
      },
      {
        id: VAULT,
        kind: 'nav',
        nav: { axis: 'y', count: actions.length },
        neighbors: { up: AGENDA_VIEWS },
        onActivate: (index) => actions[index]?.run(),
      },
    ],
    arrival: { block: VAULT, level: 'nav', items: { [VAULT]: 0 } },
    actions: { newItem: () => actions[0]?.run() },
  });

  return (
    <div className={`${styles.notas} ${styles.cofreGrade}`}>
      <RulerBlock rulerItems={rulerItems} />
      <Block id={VAULT} title="Notas do boletim" className={styles.cofre}>
        <div className={styles.corpo}>
          {code ? (
            <>
              <p className={styles.texto}>
                Este é o seu código de recuperação. Anote em papel, fora do app. Ele aparece só esta
                vez. Sem a frase e sem o código, as notas não podem ser recuperadas.
              </p>
              <p className={styles.codigo} data-testid="codigo-recuperacao">
                {code}
              </p>
            </>
          ) : (
            <p className={styles.texto}>
              {hasVault
                ? 'As notas estão travadas. Elas se travam sozinhas depois de 2 minutos sem uso.'
                : 'As notas ficam cifradas: só abrem com a sua frase de acesso, e nunca aparecem na Agenda, no Hub nem na Mesa.'}
            </p>
          )}
          {actions.map((action, index) => (
            <NavItem
              key={action.label}
              block={VAULT}
              index={index}
              className={styles.acao}
              ring="anel"
              onOpen={action.run}
            >
              <span>{action.label}</span>
              {action.hint && <kbd>{action.hint}</kbd>}
            </NavItem>
          ))}
        </div>
      </Block>
    </div>
  );
}

function subjectsOf(data: StudyData): Subject[] {
  const years = new Set(data.years.filter((year) => !year.archived).map((year) => year.id));
  return data.subjects.filter((subject) => years.has(subject.yearId));
}

function Open(props: {
  data: StudyData;
  items: readonly Item[];
  unreadable: number;
  rulerItems: readonly RulerItem[];
}) {
  const { data, items, unreadable, rulerItems } = props;
  const subjects = subjectsOf(data);
  const subject = subjects[useSelectedIndex(SUBJECTS, subjects.length)];
  const mine = items
    .filter((item) => item.subjectId === subject?.id)
    .sort((a, b) => a.bimester - b.bimester || a.name.localeCompare(b.name, 'pt-BR'));
  const item = mine[useSelectedIndex(ITEMS, mine.length)];
  const scheme = schemeFor(subject?.id ?? '');
  const bimesters = BIMESTERS.map((number) => bimesterResult(mine, scheme, number));
  const year = yearResult(mine, scheme);
  const needed = neededInSecondSemester(mine, scheme);
  const inItems = () => getKeyboardState().focus.block === ITEMS;

  const options = (): BlockOption[] => {
    if (!subject) return [];
    return [
      { id: 'novo', label: 'Novo item', keys: 'Alt N', run: () => askItem(subject, mine) },
      ...(item && inItems()
        ? [
            { id: 'editar', label: 'Editar item', run: () => askItem(subject, mine, item) },
            { id: 'excluir', label: 'Excluir item', run: () => deleteItem(item) },
          ]
        : []),
      { id: 'agenda', label: 'Trazer da Agenda', run: () => askFromAgenda(data, subject, mine) },
      { id: 'esquema', label: 'Editar esquema de cálculo', run: () => askScheme(subject) },
      {
        id: 'copiar',
        label: 'Copiar esquema de outra matéria',
        run: () =>
          askCopyScheme(
            subject,
            subjects.filter((other) => other.id !== subject.id),
          ),
      },
      { id: 'frase', label: 'Trocar a frase de acesso', run: askChangePass },
      { id: 'pin', label: readPin() ? 'Trocar o PIN' : 'Criar um PIN neste aparelho', run: askPin },
      ...(readPin() ? [{ id: 'sem-pin', label: 'Apagar o PIN', run: dropPin }] : []),
      { id: 'travar', label: 'Travar as Notas agora', run: lock },
    ];
  };

  useBlocks({
    blocks: [
      {
        id: AGENDA_VIEWS,
        kind: 'nav',
        nav: { axis: 'x', count: 5 },
        neighbors: { down: ITEMS },
        enterGoesTo: ITEMS,
        enterKeepsItem: true,
      },
      {
        id: SUBJECTS,
        kind: 'nav',
        nav: { axis: 'y', count: subjects.length },
        neighbors: { up: AGENDA_VIEWS, right: ITEMS },
        resets: [ITEMS],
        enterGoesTo: ITEMS,
      },
      {
        id: ITEMS,
        kind: 'nav',
        nav: { axis: 'y', count: mine.length },
        neighbors: { up: AGENDA_VIEWS, left: SUBJECTS, right: SUMMARY },
        onActivate: () => subject && item && askItem(subject, mine, item),
      },
      { id: SUMMARY, kind: 'none', neighbors: { left: ITEMS, up: AGENDA_VIEWS } },
    ],
    arrival: { block: SUBJECTS, level: 'nav', items: { [SUBJECTS]: 0 } },
    options,
    actions: {
      newItem: () => {
        if (subject) askItem(subject, mine);
      },
    },
  });

  return (
    <div className={styles.notas}>
      <RulerBlock rulerItems={rulerItems} />
      <Block id={SUBJECTS} title="Matérias" className={styles.materias}>
        <div className={styles.corpo}>
          {subjects.length === 0 && <p className={styles.texto}>Crie uma matéria no Acervo.</p>}
          {subjects.map((entry, index) => {
            const result = yearResult(
              items.filter((other) => other.subjectId === entry.id),
              schemeFor(entry.id),
            );
            return (
              <NavItem
                key={entry.id}
                block={SUBJECTS}
                index={index}
                className={`${styles.linha} ${styles.materia}`}
                ring="anel-interno"
              >
                <b>{entry.code}</b>
                <span>{entry.name}</span>
                <span className={styles.nota}>{formatGrade(result.value)}</span>
              </NavItem>
            );
          })}
        </div>
      </Block>
      <Block
        id={ITEMS}
        title={subject ? `Itens de ${subject.code}` : 'Itens'}
        className={styles.itens}
        shortcut="Alt N"
        menu
      >
        <div className={styles.corpo}>
          {unreadable > 0 && (
            <p className={styles.texto}>
              {unreadable} registro(s) não puderam ser lidos com esta chave e foram ignorados.
            </p>
          )}
          {mine.length === 0 && (
            <p className={styles.texto}>
              Nenhum item. Alt N cria uma prova ou um trabalho; o ⋮ traz as provas da Agenda.
            </p>
          )}
          {mine.map((entry, index) => (
            <div key={entry.id} style={{ display: 'contents' }}>
              {(index === 0 || mine[index - 1]?.bimester !== entry.bimester) && (
                <p className={styles.grupo}>{entry.bimester}º bimestre</p>
              )}
              <NavItem
                block={ITEMS}
                index={index}
                className={styles.linha}
                ring="anel-interno"
                onOpen={() => subject && askItem(subject, mine, entry)}
              >
                <span className={styles.detalhe}>×{entry.weight}</span>
                <span>
                  {entry.name}
                  {entry.replaces ? ' (reposição)' : ''}
                </span>
                <span className={styles.nota}>
                  {entry.grade === null ? (
                    <i className={styles.parcial}>pendente</i>
                  ) : (
                    formatGrade(entry.grade)
                  )}
                </span>
                <span />
              </NavItem>
            </div>
          ))}
        </div>
      </Block>
      <Block id={SUMMARY} title="Resumo" className={styles.resumo}>
        <div className={styles.corpo}>
          {subject && (
            <>
              <dl className={styles.quadro}>
                {BIMESTERS.map((number, index) => (
                  <div key={number} style={{ display: 'contents' }}>
                    <dt>{number}º bimestre</dt>
                    <dd>{show(bimesters[index] ?? { value: null, partial: true })}</dd>
                  </div>
                ))}
                <dt>1º semestre</dt>
                <dd>{show(semesterResult(mine, scheme, 1))}</dd>
                <dt>2º semestre</dt>
                <dd>{show(semesterResult(mine, scheme, 2))}</dd>
                <dt>
                  <b>Ano</b>
                </dt>
                <dd>
                  <b>{show(year)}</b>
                </dd>
              </dl>
              <p className={styles.destaque}>
                {STATUS[statusOf(year, scheme.min)]} · mínimo {formatGrade(scheme.min)}
              </p>
              <p className={styles.texto}>
                {needed.kind === 'precisa' &&
                  `Preciso de ${formatGrade(needed.value)} no 2º semestre.`}
                {needed.kind === 'impossivel' && 'Não dá para chegar ao mínimo.'}
                {needed.kind === 'sem-dados' && 'Lance notas do 1º semestre para ver quanto falta.'}
              </p>
            </>
          )}
        </div>
      </Block>
    </div>
  );
}
