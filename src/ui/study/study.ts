import { useSyncExternalStore } from 'react';
import { isoDay } from '../../core/study/dates';
import { createFixtures } from '../../core/study/fixtures';
import { createMemoryStorage, type Storage } from '../../core/study/storage';
import type { StudyData } from '../../core/study/types';

export const today = isoDay(new Date());

// Horário fixo nos dados de exemplo, para sempre haver uma aula de agora.
export const nowTime = '13:42';

export const storage: Storage = createMemoryStorage(createFixtures(today));

export function useStudy(): StudyData {
  return useSyncExternalStore(storage.subscribe, storage.read);
}
