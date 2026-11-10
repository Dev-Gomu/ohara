import type { ReactNode } from 'react';
import { Button } from './Button';
import { Key } from './Key';
import { Target } from './Target';
import styles from './Island.module.css';

// Ilha: agrupa controles na barra do topo (telas, nível, módulos).
export function Island({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className={styles.ilha} role="group" aria-label={label}>
      {children}
    </div>
  );
}

interface TabProps {
  number: number;
  name: string;
  current?: boolean;
  cursor?: boolean;
  onOpen?: () => void;
}

// Aba: só o número, que é o próprio atalho; a atual abre e mostra o nome.
export function Tab({ number, name, current, cursor, onOpen }: TabProps) {
  return (
    <Target
      className={styles.aba}
      selected={current}
      cursor={cursor}
      onOpen={onOpen}
      label={`${number} ${name}`}
    >
      {number}
      {current && <span>{name}</span>}
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
