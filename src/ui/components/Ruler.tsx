import { Target, type TargetProps } from './Target';
import styles from './Ruler.module.css';

export interface RulerItem {
  id: string;
  title: string;
  detail?: string | undefined;
}

interface RulerProps {
  block: string;
  items: readonly RulerItem[];
  createLabel?: string;
  onCreate?: () => void;
}

interface RulerPillProps extends TargetProps {
  title: string;
  detail?: string | undefined;
}

export function RulerPill({ title, detail, ...target }: RulerPillProps) {
  return (
    <Target className={styles.item} {...target}>
      <b className={styles.titulo}>{title}</b>
      {detail !== undefined && <span className={styles.detalhe}>{detail}</span>}
    </Target>
  );
}

// Criar fica no fim da régua, é peça comum e não seleciona.
export function RulerCreate({ label, onCreate }: { label: string; onCreate?: () => void }) {
  return (
    <button type="button" className={styles.criar} onClick={onCreate}>
      {label}
    </button>
  );
}

// Régua de filtro: o que escolhe fica fora do que é escolhido.
export function Ruler({ block, items, createLabel, onCreate }: RulerProps) {
  return (
    <div className={styles.regua}>
      {items.map((item, index) => (
        <RulerPill key={item.id} nav={{ block, index }} title={item.title} detail={item.detail} />
      ))}
      {createLabel !== undefined && (
        <RulerCreate label={createLabel} {...(onCreate !== undefined && { onCreate })} />
      )}
    </div>
  );
}
