import { useState } from 'react';

const memory = new Map<string, unknown>();

// Estado de tela que sobrevive à troca de tela, só enquanto o app está aberto (D26).
export function useScreenMemory<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => (memory.has(key) ? (memory.get(key) as T) : initial));
  return [
    value,
    (next) => {
      memory.set(key, next);
      setValue(next);
    },
  ];
}

export function setScreenMemory<T>(key: string, value: T): void {
  memory.set(key, value);
}
