import { describe, expect, it } from 'vitest';
import { createFixtures } from '../study/fixtures';
import type { StudyData } from '../study/types';
import { diffStudy } from './diff';
import { classifyError } from './errors';
import { formatHlc, HLC_ZERO, parseHlc, tick } from './hlc';
import { latestVersion, pending } from './migrations';
import { fromRow, toRow } from './rows';
import { SPECS } from './specs';

const base = createFixtures('2026-11-07');

describe('toRow e fromRow', () => {
  it.each(SPECS.map((spec) => [spec.table, spec]))('ida e volta em %s', (_name, spec) => {
    const items = (base[spec.collection] as object[]).slice(0, 5);
    const sample =
      spec.table === 'note_versions'
        ? [{ id: 'n', lessonId: 'a', at: 5, html: '<p>x</p>' }]
        : items;
    expect(sample.length).toBeGreaterThan(0);
    for (const item of sample) {
      expect(fromRow(spec.table, toRow(spec.table, item))).toEqual(item);
    }
  });

  it('guarda booleano como 0 e 1 e vazio como NULL', () => {
    expect(toRow('reminders', { id: 'r', text: 't', date: 'd', done: true }).done).toBe(1);
    const lesson = base.lessons[0];
    if (!lesson) throw new Error('sem aula');
    expect(toRow('lessons', { ...lesson, folderId: null }).folder_id).toBeNull();
  });
});

describe('diffStudy', () => {
  it('não gera mudança quando nada mudou', () => {
    expect(diffStudy(base, base)).toEqual([]);
  });

  it('item igual com objeto novo não gera mudança', () => {
    const copy: StudyData = { ...base, lessons: base.lessons.map((item) => ({ ...item })) };
    expect(diffStudy(base, copy)).toEqual([]);
  });

  it('edição gera um put só', () => {
    const first = base.lessons[0];
    if (!first) throw new Error('sem aula');
    const after: StudyData = {
      ...base,
      lessons: base.lessons.map((item) => (item === first ? { ...item, notes: 'novo' } : item)),
    };
    const changes = diffStudy(base, after);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ op: 'put', table: 'lessons', row: { id: first.id } });
  });

  it('item que some vira delete', () => {
    const first = base.cards[0];
    if (!first) throw new Error('sem cartão');
    const after: StudyData = { ...base, cards: base.cards.slice(1) };
    expect(diffStudy(base, after)).toEqual([{ op: 'delete', table: 'cards', id: first.id }]);
  });

  it('inserção gera put em cada coleção', () => {
    const add = <T extends { id: string }>(items: readonly T[]) => {
      const first = items[0];
      if (!first) throw new Error('coleção vazia');
      return [...items, { ...first, id: 'novo' }];
    };
    const after: StudyData = {
      years: add(base.years),
      subjects: add(base.subjects),
      folders: add(base.folders),
      lessons: add(base.lessons),
      cards: add(base.cards),
      exams: add(base.exams),
      events: add(base.events),
      slots: add(base.slots),
      reminders: add(base.reminders),
      noteVersions: [{ id: 'v', lessonId: 'a', at: 1, html: 'h' }],
    };
    const changes = diffStudy(base, after);
    expect(changes).toHaveLength(10);
    expect(new Set(changes.map((item) => ('table' in item ? item.table : ''))).size).toBe(10);
  });
});

describe('relógio híbrido', () => {
  it('relógio parado aumenta o contador', () => {
    const first = tick(HLC_ZERO, 1000);
    expect(tick(first, 1000)).toEqual({ ms: 1000, counter: 1 });
  });

  it('relógio que volta no tempo não anda para trás', () => {
    const first = tick(HLC_ZERO, 5000);
    expect(tick(first, 1000)).toEqual({ ms: 5000, counter: 1 });
  });

  it('ordena como texto', () => {
    const a = formatHlc({ ms: 999, counter: 9 }, 'x');
    const b = formatHlc({ ms: 1000, counter: 0 }, 'x');
    const c = formatHlc({ ms: 1000, counter: 1 }, 'x');
    expect([c, a, b].sort()).toEqual([a, b, c]);
  });

  it('lê o que escreveu', () => {
    expect(parseHlc(formatHlc({ ms: 1234, counter: 7 }, 'dev'))).toEqual({ ms: 1234, counter: 7 });
    expect(parseHlc(null)).toEqual(HLC_ZERO);
  });
});

describe('migrações pendentes', () => {
  const all = [
    { version: 2, sql: 'b' },
    { version: 1, sql: 'a' },
    { version: 3, sql: 'c' },
  ];

  it('banco novo roda todas, em ordem', () => {
    expect(pending(all, 0).map((item) => item.version)).toEqual([1, 2, 3]);
  });

  it('banco no meio roda o resto', () => {
    expect(pending(all, 2).map((item) => item.version)).toEqual([3]);
  });

  it('banco em dia não roda nada', () => {
    expect(pending(all, 3)).toEqual([]);
    expect(latestVersion(all)).toBe(3);
  });
});

describe('classifyError', () => {
  it('reconhece cada código', () => {
    expect(classifyError('x', 'QuotaExceededError')).toBe('cota');
    expect(classifyError('SQLITE_FULL: database or disk is full', 'Error')).toBe('cota');
    expect(classifyError('SQLITE_CORRUPT: database disk image is malformed', 'Error')).toBe(
      'corrompido',
    );
    expect(classifyError('file is not a database', 'Error')).toBe('corrompido');
    expect(classifyError('Missing required OPFS APIs', 'Error')).toBe('opfs-indisponivel');
    expect(classifyError('x', 'SecurityError')).toBe('opfs-indisponivel');
    expect(classifyError('algo estranho', 'Error')).toBe('desconhecido');
  });

  it('usa a fase quando não reconhece', () => {
    expect(classifyError('syntax error', 'Error', 'migracao')).toBe('migracao');
    expect(classifyError('constraint', 'Error', 'gravacao')).toBe('gravacao');
    expect(classifyError('SQLITE_FULL', 'Error', 'gravacao')).toBe('cota');
  });
});
