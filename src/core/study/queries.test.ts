import { describe, expect, it } from 'vitest';
import { createFixtures } from './fixtures';
import {
  ALL_FOLDERS,
  currentEventIndex,
  eventsOn,
  filterLessons,
  folderTabs,
  initialTabIndex,
  lessonsOf,
  NO_FOLDER,
  upcomingExams,
} from './queries';

const today = '2026-11-07';
const data = createFixtures(today);

describe('pastas', () => {
  it('Todas vem primeiro e Sem bimestre por último', () => {
    const tabs = folderTabs(data, 'imu');
    expect(tabs[0]?.id).toBe(ALL_FOLDERS);
    expect(tabs.at(-1)?.id).toBe(NO_FOLDER);
  });

  it('as contagens somam o total', () => {
    const [all, ...rest] = folderTabs(data, 'imu');
    expect(rest.reduce((sum, tab) => sum + tab.count, 0)).toBe(all?.count);
  });

  it('filtra aulas sem pasta', () => {
    const loose = filterLessons(lessonsOf(data, 'imu'), NO_FOLDER);
    expect(loose.length).toBeGreaterThan(0);
    expect(loose.every((lesson) => lesson.folderId === null)).toBe(true);
  });

  it('abre no bimestre mais recente com aulas (D76)', () => {
    const tabs = folderTabs(data, 'imu');
    const index = initialTabIndex(tabs, data, 'imu');
    expect(tabs[index]?.name).toBe('2º bimestre');
  });

  it('matéria sem aulas abre em Todas', () => {
    expect(initialTabIndex(folderTabs(data, 'bio'), data, 'bio')).toBe(0);
  });
});

describe('dia', () => {
  it('provas vêm por data e ignoram as passadas', () => {
    const dates = upcomingExams(data, today).map((exam) => exam.date);
    expect(dates).toEqual([...dates].sort());
    expect(dates.every((date) => date >= today)).toBe(true);
  });

  it('acha a aula de agora ou a próxima', () => {
    const events = eventsOn(data, today);
    expect(currentEventIndex(events, '13:30')).toBe(2);
    expect(currentEventIndex(events, '09:45')).toBe(1);
    expect(currentEventIndex(events, '23:00')).toBe(events.length - 1);
  });
});
