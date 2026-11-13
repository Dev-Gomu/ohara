import { Fragment, useEffect, useMemo, useState } from 'react';
import type { Diagnostics } from '../../../core/db/protocol';
import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { storage } from '../../study/study';
import { buildSections, type Row } from './configsData';
import styles from './Configs.module.css';

const SECTIONS = 'configs.secoes';
const DETAIL = 'configs.detalhe';

export function Configs() {
  const [diag, setDiag] = useState<Diagnostics | null>(null);
  useEffect(() => {
    void storage.diagnose().then(setDiag);
  }, []);
  // Quem troca um ajuste muda o valor da linha: o número sobe para a lista ser montada de novo.
  const [changes, setChanges] = useState(0);
  const SECTION_LIST = useMemo(() => buildSections(diag), [diag, changes]); // eslint-disable-line react-hooks/exhaustive-deps
  const run = (row: Row | undefined) => {
    row?.run?.();
    setChanges((n) => n + 1);
  };
  const index = useSelectedIndex(SECTIONS, SECTION_LIST.length);
  const section = SECTION_LIST[index];
  const rows = section?.rows ?? [];

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
  });

  return (
    <ScreenFrame title="Configs">
      <div className={styles.colunas}>
        <Block id={SECTIONS} title="Seções">
          <div className={styles.lista}>
            {SECTION_LIST.map(({ name }, position) => (
              <NavItem key={name} block={SECTIONS} index={position} className={styles.secao}>
                {name}
              </NavItem>
            ))}
          </div>
        </Block>
        <Block id={DETAIL} title={section?.name} label="Detalhe">
          <div className={styles.lista}>
            {rows.map((row, position) => (
              <Fragment key={row.label}>
                {row.group && <h3 className={styles.grupo}>{row.group}</h3>}
                <NavItem
                  block={DETAIL}
                  index={position}
                  className={styles.linha}
                  onOpen={() => run(row)}
                >
                  <span className={styles.texto}>
                    <b className={styles.rotulo}>{row.label}</b>
                    <span className={styles.detalhe}>{row.detail}</span>
                    {row.warning && <span className={styles.aviso}>{row.warning}</span>}
                  </span>
                  {row.value && <span className={styles.valor}>{row.value}</span>}
                </NavItem>
              </Fragment>
            ))}
          </div>
        </Block>
      </div>
    </ScreenFrame>
  );
}
