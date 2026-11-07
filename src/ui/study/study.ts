import { useSyncExternalStore } from 'react';
import { isoDay } from '../../core/study/dates';
import type { Storage } from '../../core/study/storage';
import type { StudyData } from '../../core/study/types';

export const today = isoDay(new Date());

// Horário fixo nos dados de exemplo, para sempre haver uma aula de agora.
export const nowTime = '13:42';

// Definido por main.tsx antes de desenhar qualquer tela: a UI nunca abre o banco.
export let storage: Storage;

export function setStorage(next: Storage): void {
  storage = next;
}

export function useStudy(): StudyData {
  return useSyncExternalStore(storage.subscribe, storage.read);
}
