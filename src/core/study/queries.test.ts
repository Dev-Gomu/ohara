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
  slotsOn,
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

describe('Grade', () => {
  const slot = {
    id: 's',
    subjectId: 'bio',
    weekday: 1,
    start: '07:00',
    end: '08:00',
    every: 1 as const,
    anchor: '2026-11-02',
    label: 'Teoria',
    room: '',
  };

  it('a regra semanal gera aulas virtuais no dia certo', () => {
    const next = { ...data, slots: [slot] };
    expect(eventsOn(next, '2026-11-09').map((event) => event.title)).toEqual(['Teoria']);
    expect(eventsOn(next, '2026-11-10')).toEqual([]);
  });

  it('a quinzenal pula uma semana', () => {
    const next = { ...data, slots: [{ ...slot, every: 2 as const }] };
    expect(eventsOn(next, '2026-11-02')).toHaveLength(1);
    expect(eventsOn(next, '2026-11-09')).toHaveLength(0);
    expect(eventsOn(next, '2026-11-16')).toHaveLength(1);
  });

  it('aula real no mesmo horário toma o lugar da virtual', () => {
    const real = {
      id: 'r',
      kind: 'aula' as const,
      subjectId: 'bio',
      lessonId: 'x',
      title: 'Real',
      date: '2026-11-09',
      start: '07:00',
      end: '08:00',
    };
    const next = { ...data, slots: [slot], events: [real] };
    expect(eventsOn(next, '2026-11-09').map((event) => event.title)).toEqual(['Real']);
  });

  it('lista as regras do dia da semana por horário', () => {
    const late = { ...slot, id: 't', start: '09:00' };
    const next = { ...data, slots: [late, slot] };
    expect(slotsOn(next, 1).map((item) => item.start)).toEqual(['07:00', '09:00']);
  });
});
