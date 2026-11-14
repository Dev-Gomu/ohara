import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { TRASH_KEYS } from '../../core/keyboard/keys';
import { isoDay, shortDate } from '../../core/study/dates';
import { groupOf, TRASH_DAYS } from '../../core/study/trash';
import {
  kindInfo,
  leavesText,
  supportText,
  TRASH_KINDS,
  trashEntries,
  whenText,
  type TrashEntry,
} from '../../core/study/trashList';
import { Field } from '../components/Controls';
import { Key } from '../components/Key';
import { SubjectPill } from '../components/Pill';
import { RulerPill } from '../components/Ruler';
import { ConfirmBox, TrashRow, type RowAction } from '../components/TrashRow';
import { Window } from '../components/Window';
import { registerWindowActions, useKeyboardState } from '../keyboard/store';
import { showNotice, useNotice } from '../study/notice';
import { storage, useStudy } from '../study/study';
import { restoreWithUndo, runUndo, useUndo } from '../study/undo';
import { TRASH_WINDOW } from './commands';
import { getTrashUi, resetTrashUi, setTrashUi, useTrashUi, type TrashUi } from './trashState';
import styles from './TrashWindow.module.css';

const KINDS: readonly { id: TrashUi['kind']; name: string }[] = [
  { id: 'tudo', name: 'Tudo' },
  ...TRASH_KINDS,
];
const ACTIONS: readonly RowAction[] = [
  { id: 'restaurar', label: 'Restaurar', keys: 'Enter' },
  { id: 'apagar', label: 'Apagar de vez…', danger: true },
];

// Rodapé gerado da tabela: as teclas da lista, juntas pelo que fazem.
const HINTS: readonly [string, string][] = [
  ...[...new Set(TRASH_KEYS.filter((key) => key.when.includes('list')).map((key) => key.text))].map(
    (text): [string, string] => [
      TRASH_KEYS.filter((key) => key.when.includes('list') && key.text === text)
        .map((key) => key.label)
        .join(' '),
      text,
    ],
  ),
  ['Esc', 'fecha'],
];

const itemsText = (n: number) => (n === 0 ? 'vazio' : `${n} ${n === 1 ? 'item' : 'itens'}`);
const short = (text: string) => (text.length > 34 ? `${text.slice(0, 32)}…` : text);
const plain = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

function matches(entry: TrashEntry, term: string): boolean {
  return term === '' || plain(`${entry.title} ${entry.subject?.code ?? ''}`).includes(term);
}

function focusList(): void {
  document.querySelector<HTMLElement>('[data-trash-list]')?.focus({ preventScroll: true });
}

function Pill({ entry }: { entry: TrashEntry }) {
  return entry.subject ? (
    <SubjectPill code={entry.subject.code} color={entry.subject.color} />
  ) : null;
}

// Prévia do item escolhido: sigla e tipo, título, e três fatos (rótulo em cima, valor embaixo).
function Details({ entry }: { entry: TrashEntry }) {
  const leaves = leavesText(entry.left);
  return (
    <div className={styles.ficha}>
      <div className={styles.fichaTopo}>
        <Pill entry={entry} />
        <span>{kindInfo(entry.kind).one}</span>
      </div>
      <h3 className={styles.fichaTitulo}>{entry.title}</h3>
      <dl className={styles.fatos}>
        <div>
          <dt>Na lixeira desde</dt>
          <dd>
            {shortDate(isoDay(new Date(entry.at)))} · {whenText(entry.age)}
          </dd>
        </div>
        <div>
          <dt>Some</dt>
          <dd data-atencao={leaves !== null || undefined}>
            {entry.left === 0 ? 'hoje' : `em ${entry.left} ${entry.left === 1 ? 'dia' : 'dias'}`}
          </dd>
        </div>
        <div>
          <dt>Volta junto</dt>
          <dd>{entry.brings || 'nada mais'}</dd>
        </div>
      </dl>
      {entry.parents.length > 0 && (
        <p className={styles.nota}>
          Também está na lixeira: “{entry.parents.join('”, “')}”. Restaurar traz junto.
        </p>
      )}
    </div>
  );
}

// Lixeira (D164): régua de tipos, busca e lista no meio, prévia à direita. Teclas: TRASH_KEYS.
export function TrashWindow() {
  const { focus } = useKeyboardState();
  const open = focus.window === TRASH_WINDOW;
  const data = useStudy();
  const trash = useSyncExternalStore(storage.subscribe, storage.readTrash);
  const ui = useTrashUi();
  const undo = useUndo();
  const notice = useNotice();
  const entries = useMemo(() => trashEntries(trash, data, new Date()), [trash, data]);
  const term = plain(ui.search.trim());
  const visible = entries.filter(
    (entry) => (ui.kind === 'tudo' || entry.kind === ui.kind) && matches(entry, term),
  );
  const cursor = Math.min(ui.cursor, Math.max(visible.length - 1, 0));
  const current = visible[cursor];

  useEffect(() => {
    if (open) resetTrashUi();
  }, [open]);

  function restore(): void {
    if (!current) return;
    const what = kindInfo(current.kind).one.toLowerCase();
    const extra = current.parents.length > 0 ? `, com “${short(current.parents[0] ?? '')}”` : '';
    restoreWithUndo(`Voltou ao lugar: ${what} “${short(current.title)}”${extra}`, current.id);
    setTrashUi({ menu: false });
    focusList();
  }

  function purge(): void {
    if (!current) return;
    void storage.purge(groupOf(trash, current.id));
    showNotice(`Apagou de vez: “${short(current.title)}”`);
    setTrashUi({ menu: false, confirm: false });
    focusList();
  }

  function choose(id: string): void {
    if (id === 'restaurar') restore();
    else setTrashUi({ menu: false, confirm: true });
  }

  // Registrada de novo a cada desenho: a tecla sempre vê a lista e o cursor atuais.
  useEffect(() =>
    registerWindowActions(TRASH_WINDOW, (change) => {
      const ui = getTrashUi();
      const now = {
        visible,
        cursor: Math.min(ui.cursor, Math.max(visible.length - 1, 0)),
        ui,
        restore,
      };
      switch (change.type) {
        case 'trashMove':
          if (change.delta !== 0) {
            const last = Math.max(now.visible.length - 1, 0);
            setTrashUi({ cursor: Math.max(0, Math.min(last, now.cursor + change.delta)) });
          }
          focusList();
          return true;
        case 'trashKind': {
          const index = KINDS.findIndex((kind) => kind.id === now.ui.kind) + change.delta;
          setTrashUi({
            kind: KINDS[(index + KINDS.length) % KINDS.length]?.id ?? 'tudo',
            cursor: 0,
          });
          return true;
        }
        case 'trashRestore':
          now.restore();
          return true;
        case 'trashMenu':
          if (now.visible.length > 0) setTrashUi({ menu: !now.ui.menu });
          return true;
        case 'trashSearch':
          document.querySelector<HTMLElement>('[data-trash-search]')?.focus();
          return true;
        case 'trashBack':
          setTrashUi(now.ui.confirm ? { confirm: false } : { menu: false });
          focusList();
          return true;
        default:
          return false;
      }
    }),
  );

  const count = (id: TrashUi['kind']) =>
    entries.filter((entry) => id === 'tudo' || entry.kind === id).length;
  const status = undo && !undo.removal ? undo.label : notice;

  return (
    <Window
      id={TRASH_WINDOW}
      title="Lixeira"
      detail={`${itemsText(entries.length).replace('vazio', 'Vazia')} · somem após ${TRASH_DAYS} dias`}
      testId="lixeira"
      wide
    >
      <div className={styles.corpo}>
        <nav className={styles.regua} aria-label="Tipos">
          {KINDS.map((kind) => (
            <RulerPill
              key={kind.id}
              title={kind.name}
              detail={itemsText(count(kind.id))}
              selected={ui.kind === kind.id}
              onOpen={() => setTrashUi({ kind: kind.id, cursor: 0, menu: false })}
            />
          ))}
        </nav>
        <div className={styles.grade}>
          <div className={styles.meio}>
            <Field
              label="Buscar na lixeira"
              shortcut="Alt F"
              data-trash-search=""
              value={ui.search}
              onChange={(event) =>
                setTrashUi({ search: event.target.value, cursor: 0, menu: false })
              }
            />
            {visible.length === 0 ? (
              <div className={styles.vazia}>
                {term !== '' ? (
                  <span>Nada com “{ui.search.trim()}” na lixeira.</span>
                ) : (
                  <>
                    <b>A lixeira está vazia.</b>
                    <span>O que você excluir fica aqui por {TRASH_DAYS} dias, para restaurar.</span>
                  </>
                )}
              </div>
            ) : (
              <ul
                className={styles.lista}
                data-trash-list=""
                tabIndex={-1}
                aria-label="Itens na lixeira"
              >
                {visible.map((entry, index) => (
                  <TrashRow
                    key={entry.id}
                    lead={<Pill entry={entry} />}
                    title={entry.title}
                    detail={supportText(entry, ui.kind === 'tudo')}
                    leaves={leavesText(entry.left)}
                    when={whenText(entry.age)}
                    selected={index === cursor}
                    cursor={index === cursor && !ui.menu && !ui.confirm}
                    menuOpen={index === cursor && ui.menu}
                    actions={ACTIONS}
                    onSelect={() => setTrashUi({ cursor: index, menu: false })}
                    onRestore={restore}
                    onMenu={() => setTrashUi({ menu: !ui.menu })}
                    onAction={choose}
                  />
                ))}
              </ul>
            )}
          </div>
          <aside className={styles.previa}>
            {current ? <Details entry={current} /> : <p className={`${styles.ficha} ${styles.nota}`}>Nada escolhido.</p>}
          </aside>
        </div>
        <p className={styles.teclas}>
          {HINTS.map(([keys, text]) => (
            <span key={keys}>
              <Key>{keys}</Key> {text}
            </span>
          ))}
        </p>
        {status && (
          <p className={styles.aviso} role="status" data-testid="lixeira-aviso">
            <span>{status}</span>
            {undo && !undo.removal && (
              <button type="button" className={styles.desfazer} onClick={runUndo}>
                Desfazer <Key>Alt Z</Key>
              </button>
            )}
          </p>
        )}
        {ui.confirm && current && (
          <ConfirmBox
            title="Apagar de vez?"
            confirmLabel="Apagar de vez"
            onCancel={() => {
              setTrashUi({ confirm: false });
              focusList();
            }}
            onConfirm={purge}
          >
            <p>
              <b>{current.title}</b>
            </p>
            <p className={styles.apoio}>
              {current.brings ? `Some junto: ${current.brings}. ` : ''}Não dá para desfazer.
            </p>
          </ConfirmBox>
        )}
      </div>
    </Window>
  );
}
