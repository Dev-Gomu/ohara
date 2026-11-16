import { useEffect, useMemo, useState } from 'react';
import type { Diagnostics } from '../../../core/db/protocol';
import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { getKeyboardState } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { useCardView } from '../../study/cardView';
import { storage } from '../../study/study';
import { CardSample, ChoiceView } from './ChoiceView';
import { buildSections, type Row } from './configsData';
import styles from './Configs.module.css';

const SECTIONS = 'configs.secoes';
const DETAIL = 'configs.detalhe';
// Grupo que mostra, ao lado das linhas, o cartão real que muda com elas (D160).
const CARD_GROUP = 'Cartões';

interface Group {
  name: string | undefined;
  rows: { row: Row; index: number }[];
}

function groupsOf(rows: readonly Row[]): Group[] {
  const groups: Group[] = [];
  rows.forEach((row, index) => {
    const last = groups[groups.length - 1];
    if (!last || row.group) groups.push({ name: row.group, rows: [{ row, index }] });
    else last.rows.push({ row, index });
  });
  return groups;
}

export function Configs() {
  const [diag, setDiag] = useState<Diagnostics | null>(null);
  useEffect(() => {
    void storage.diagnose().then(setDiag);
  }, []);
  const cardView = useCardView();
  // Quem troca um ajuste muda o valor da linha: o número sobe para a lista ser montada de novo.
  const [changes, setChanges] = useState(0);
  const changed = () => setChanges((n) => n + 1);
  const SECTION_LIST = useMemo(() => buildSections(diag), [diag, changes, cardView]); // eslint-disable-line react-hooks/exhaustive-deps
  const run = (row: Row | undefined) => {
    row?.run?.();
    changed();
  };
  const index = useSelectedIndex(SECTIONS, SECTION_LIST.length);
  const section = SECTION_LIST[index];
  const rows = section?.rows ?? [];

  const stepOption = (delta: number): boolean => {
    const { focus } = getKeyboardState();
    if (focus.block !== DETAIL) return false;
    const choice = rows[focus.items[DETAIL] ?? 0]?.choice;
    if (!choice) return false;
    const next = choice.options[choice.options.findIndex((o) => o.id === choice.current) + delta];
    if (next) choice.set(next.id);
    changed();
    return true;
  };

  useBlocks({
    blocks: [
      {
        id: SECTIONS,
        kind: 'nav',
        nav: { axis: 'y', count: SECTION_LIST.length },
        neighbors: { right: DETAIL },
        resets: [DETAIL],
        enterGoesTo: DETAIL,
      },
      {
        id: DETAIL,
        kind: 'nav',
        nav: { axis: 'y', count: rows.length },
        neighbors: { left: SECTIONS },
        onActivate: (row) => run(rows[row]),
      },
    ],
    arrival: { block: SECTIONS, level: 'nav' },
    actions: { optionStep: (change) => change.type === 'optionStep' && stepOption(change.delta) },
  });

  const line = ({ row, index: position }: Group['rows'][number]) => (
    <NavItem
      key={row.label}
      block={DETAIL}
      index={position}
      className={row.choice && (row.choice.look === 'paleta' || row.choice.look === 'menu') ? `${styles.linha} ${styles.amostras}` : styles.linha}
      choice={row.choice !== undefined}
      onOpen={() => run(row)}
    >
      <span className={styles.texto}>
        <b className={styles.rotulo}>{row.label}</b>
        <span className={styles.detalhe}>{row.detail}</span>
        {row.warning && <span className={styles.aviso}>{row.warning}</span>}
      </span>
      {row.choice ? (
        <ChoiceView choice={row.choice} onChange={changed} />
      ) : (
        row.value && <span className={styles.valor}>{row.value}</span>
      )}
    </NavItem>
  );

  return (
    <ScreenFrame title="Configs">
      <div className={styles.colunas}>
        <Block id={SECTIONS} title="Seções">
          <div className={styles.lista}>
            {SECTION_LIST.map(({ name, summary }, position) => (
              <NavItem key={name} block={SECTIONS} index={position} className={styles.secao}>
                <b className={styles.rotulo}>{name}</b>
                <span className={styles.detalhe}>{summary}</span>
              </NavItem>
            ))}
          </div>
        </Block>
        <Block id={DETAIL} title={section?.name} label="Detalhe">
          <div className={styles.lista}>
            {groupsOf(rows).map((group, position) => (
              <section key={group.name ?? position} className={styles.bloco}>
                {group.name && <h3 className={styles.grupo}>{group.name}</h3>}
                {group.name === CARD_GROUP ? (
                  <div className={styles.lado}>
                    <div className={styles.linhas}>{group.rows.map(line)}</div>
                    <CardSample view={cardView} />
                  </div>
                ) : (
                  group.rows.map(line)
                )}
              </section>
            ))}
          </div>
        </Block>
      </div>
    </ScreenFrame>
  );
}
