import type { ReactNode } from 'react';
import { Button } from './Button';
import { Key } from './Key';
import { Target } from './Target';
import styles from './Island.module.css';

// Ilha: agrupa controles na barra do topo (telas, nível, módulos).
export function Island({
  label,
  slides,
  children,
}: {
  label?: string;
  // A aba atual é desenhada por um indicador que desliza (ver shell/topAnimation).
  slides?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.ilha} role="group" aria-label={label} data-desliza={slides ? '' : undefined}>
      {children}
    </div>
  );
}

interface TabProps {
  number: number;
  name: string;
  current?: boolean;
  cursor?: boolean;
  menuItem?: boolean;
  onOpen?: () => void;
  icon?: ReactNode;
  // Como o número e o ícone aparecem (Ajustes, D129).
  show?: 'numeros' | 'ambos' | 'icones' | 'sobrescrito' | 'subscrito';
}

// Aba: ícone da tela e número, que é o próprio atalho. O nome da tela fica no título da barra.
export function Tab(props: TabProps) {
  const { number, name, current, cursor, menuItem, onOpen, icon, show = 'ambos' } = props;
  return (
    <Target
      className={styles.aba}
      selected={current}
      cursor={cursor}
      menuItem={menuItem}
      onOpen={onOpen}
      label={`${number} ${name}`}
    >
      {show === 'sobrescrito' || show === 'subscrito' ? (
        <span className={styles.canto} data-canto={show}>
          {icon}
          <sup className={styles.pequeno}>{number}</sup>
        </span>
      ) : (
        <>
          {show !== 'numeros' && icon}
          {show !== 'icones' && number}
        </>
      )}
    </Target>
  );
}

const LEVELS = { menu: 'Menu', block: 'Bloco', field: 'Campo' };

// Indicador de nível: um por tela, com as teclas que valem agora.
export function LevelIndicator({ level, keys }: { level: keyof typeof LEVELS; keys: string[] }) {
  return (
    <Island label="Nível do teclado">
      <b className={styles.nivel}>{LEVELS[level]}</b>
      {keys.map((key) => (
        <Key key={key}>{key}</Key>
      ))}
    </Island>
  );
}

// Modo passageiro (Redimensionar): toma o lugar dos controles da barra enquanto dura.
// "Pronto" existe para o toque; no teclado, Enter ou Esc terminam.
export function ModeIndicator({
  name,
  keys,
  onDone,
}: {
  name: string;
  keys: string[];
  onDone: () => void;
}) {
  return (
    <Island label={`Modo ${name}`}>
      <b className={styles.nivel} role="status">
        {name}
      </b>
      {keys.map((key) => (
        <Key key={key}>{key}</Key>
      ))}
      <Button variant="primary" onPress={onDone}>
        Pronto
      </Button>
    </Island>
  );
}
