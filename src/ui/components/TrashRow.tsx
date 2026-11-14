import { useEffect, useRef, type ReactNode } from 'react';
import { Menu, MenuItem } from 'react-aria-components';
import { Button } from './Button';
import { Key } from './Key';
import styles from './TrashRow.module.css';

interface MoreButtonProps {
  label: string;
  expanded: boolean;
  onPress: () => void;
}

// ⋮ de toque (44 px): abre as mesmas opções do Alt O.
export function MoreButton({ label, expanded, onPress }: MoreButtonProps) {
  return (
    <button
      type="button"
      className={styles.mais}
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={expanded}
      onClick={onPress}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
        <rect x="10.5" y="4" width="3" height="4" rx="1.5" />
        <rect x="10.5" y="10" width="3" height="4" rx="1.5" />
        <rect x="10.5" y="16" width="3" height="4" rx="1.5" />
      </svg>
    </button>
  );
}

export interface RowAction {
  id: string;
  label: string;
  keys?: string;
  // Ação que não se desfaz: texto na cor de atenção.
  danger?: boolean;
}

// Menu do ⋮ dentro da linha. Setas e Enter são do React Aria; o Esc, do listener.
export function RowMenu({
  actions,
  onAction,
}: {
  actions: readonly RowAction[];
  onAction: (id: string) => void;
}) {
  return (
    <Menu
      autoFocus="first"
      aria-label="Opções"
      items={actions}
      onAction={(id) => onAction(String(id))}
      className={styles.menu}
    >
      {(action) => (
        <MenuItem
          className={styles.opcao}
          data-perigo={action.danger || undefined}
          textValue={action.label}
        >
          <span>{action.label}</span>
          {action.keys !== undefined && <Key>{action.keys}</Key>}
        </MenuItem>
      )}
    </Menu>
  );
}

interface TrashRowProps {
  lead?: ReactNode;
  title: string;
  // "excluída há 3 d · volta com 9 cartões".
  detail: string;
  // "some em 5 d" nos últimos 7 dias: texto, sem barra.
  leaves?: string | null;
  // Quando, à direita, na linha não escolhida.
  when: string;
  selected: boolean;
  cursor: boolean;
  menuOpen: boolean;
  actions: readonly RowAction[];
  onSelect: () => void;
  onRestore: () => void;
  onMenu: () => void;
  onAction: (id: string) => void;
}

// Linha da Lixeira (D164): sigla, título e apoio; a escolhida mostra Restaurar e ⋮ (toque).
export function TrashRow(props: TrashRowProps) {
  const { lead, title, detail, leaves, when, selected, cursor, menuOpen, actions } = props;
  const row = useRef<HTMLLIElement>(null);
  // A lista rola por dentro: a escolhida sempre fica à vista, ao descer e ao subir.
  useEffect(() => {
    if (selected) row.current?.scrollIntoView({ block: 'nearest' });
  }, [selected]);
  return (
    <li
      ref={row}
      className={styles.linha}
      data-sel={selected}
      data-cursor={cursor ? '' : undefined}
      aria-selected={selected}
      onClick={props.onSelect}
    >
      <span className={styles.sigla}>{lead}</span>
      <span className={styles.texto}>
        <b className={styles.titulo}>{title}</b>
        <span className={styles.apoio}>
          {detail}
          {leaves ? <span className={styles.fim}> · {leaves}</span> : null}
        </span>
      </span>
      {selected ? (
        <span className={styles.acoes} onClick={(event) => event.stopPropagation()}>
          <Button variant="primary" onPress={props.onRestore}>
            Restaurar
          </Button>
          <MoreButton label="Opções" expanded={menuOpen} onPress={props.onMenu} />
          {menuOpen && <RowMenu actions={actions} onAction={props.onAction} />}
        </span>
      ) : (
        <span className={styles.quando}>{when}</span>
      )}
    </li>
  );
}

interface ConfirmBoxProps {
  title: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  children: ReactNode;
}

// Confirmação de ação sem volta, dentro da janela: o foco nasce em Cancelar, então Enter sozinho
// nunca apaga. Os dois botões têm o mesmo tamanho; o perigoso é só contorno.
export function ConfirmBox({
  title,
  confirmLabel,
  onCancel,
  onConfirm,
  children,
}: ConfirmBoxProps) {
  return (
    <div className={styles.veu} role="alertdialog" aria-label={title}>
      <div className={styles.caixa}>
        <h3 className={styles.pergunta}>{title}</h3>
        {children}
        <div className={styles.pe}>
          <button type="button" className={styles.bt} autoFocus onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className={`${styles.bt} ${styles.perigo}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
