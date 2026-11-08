import { NavItem } from './NavItem';
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

// Régua de filtro: o que escolhe fica fora do que é escolhido. Criar não seleciona.
export function Ruler({ block, items, createLabel, onCreate }: RulerProps) {
  return (
    <div className={styles.regua}>
      {items.map((item, index) => (
        <NavItem key={item.id} block={block} index={index} className={styles.item} ring="anel">
          <b className={styles.titulo}>{item.title}</b>
          {item.detail !== undefined && <span className={styles.detalhe}>{item.detail}</span>}
        </NavItem>
      ))}
      {createLabel !== undefined && (
        <button type="button" className={styles.criar} onClick={onCreate}>
          {createLabel}
        </button>
      )}
    </div>
  );
}
