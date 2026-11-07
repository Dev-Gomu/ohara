import { Block } from '../../components/Block';
import { NavItem, useSelectedIndex } from '../../components/NavItem';
import { dispatch } from '../../keyboard/store';
import { useBlocks } from '../../keyboard/useBlocks';
import { ScreenFrame } from '../../shell/ScreenFrame';
import { toggleTheme } from '../../theme';
import styles from './Configs.module.css';

const SECTIONS = 'configs.secoes';
const DETAIL = 'configs.detalhe';

interface Row {
  label: string;
  detail: string;
  run?: () => void;
}

const LATER = 'Disponível quando os dados reais chegarem.';

const SECTION_LIST: readonly { name: string; rows: readonly Row[] }[] = [
  {
    name: 'Aparência',
    rows: [{ label: 'Trocar tema', detail: 'Claro ou escuro, neste aparelho.', run: toggleTheme }],
  },
  {
    name: 'Atalhos',
    rows: [
      {
        label: 'Ver todos os atalhos',
        detail: 'Abre a lista gerada da tabela de teclas.',
        run: () => dispatch({ type: 'openHelp' }),
      },
    ],
  },
  { name: 'Sincronização', rows: [{ label: 'Google Drive', detail: LATER }] },
  { name: 'Backup', rows: [{ label: 'Exportar e restaurar', detail: LATER }] },
  { name: 'Segurança', rows: [{ label: 'Frase de acesso das Notas', detail: LATER }] },
  { name: 'Sobre', rows: [{ label: 'Ohara', detail: `Versão ${__APP_VERSION__}` }] },
];

export function Configs() {
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
        onActivate: (row) => rows[row]?.run?.(),
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
              <NavItem
                key={row.label}
                block={DETAIL}
                index={position}
                className={styles.linha}
                onOpen={row.run}
              >
                <b className={styles.rotulo}>{row.label}</b>
                <span className={styles.detalhe}>{row.detail}</span>
              </NavItem>
            ))}
          </div>
        </Block>
      </div>
    </ScreenFrame>
  );
}
