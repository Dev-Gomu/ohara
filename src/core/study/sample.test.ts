import { describe, expect, it } from 'vitest';
import { hasCloze } from './cloze';
import { createSample } from './sample';

const today = '2026-11-15';
const data = createSample(today);
const ids = (list: readonly { id: string }[]) => list.map((item) => item.id);

describe('dados do modo exemplo', () => {
  it('não repete id em nenhuma tabela', () => {
    for (const list of [
      data.subjects,
      data.folders,
      data.lessons,
      data.cards,
      data.events,
      data.slots,
      data.reminders,
      data.exams,
      data.attendance,
    ]) {
      expect(new Set(ids(list)).size).toBe(list.length);
    }
  });

  it('toda referência aponta para algo que existe', () => {
    const subjects = new Set(ids(data.subjects));
    const lessons = new Set(ids(data.lessons));
    const folders = new Set(ids(data.folders));
    expect(data.subjects.every((s) => data.years.some((y) => y.id === s.yearId))).toBe(true);
    expect(
      data.lessons.every(
        (l) => subjects.has(l.subjectId) && (l.folderId === null || folders.has(l.folderId)),
      ),
    ).toBe(true);
    expect(data.cards.every((c) => lessons.has(c.lessonId))).toBe(true);
    expect(data.events.every((e) => e.subjectId === '' || subjects.has(e.subjectId))).toBe(true);
    expect(data.exams.every((e) => subjects.has(e.subjectId))).toBe(true);
    expect(data.noteVersions.every((v) => lessons.has(v.lessonId))).toBe(true);
  });

  it('cobre os casos de borda do app', () => {
    expect(data.years.some((y) => y.archived)).toBe(true);
    expect(data.subjects.some((s) => data.lessons.every((l) => l.subjectId !== s.id))).toBe(true);
    expect(data.lessons.some((l) => l.folderId === null)).toBe(true);
    expect(data.lessons.filter((l) => l.subjectId === 'fis').length).toBeGreaterThan(40);
    expect(
      data.exams.some((e) => e.date === '') &&
        data.exams.some((e) => e.date !== '' && e.time === ''),
    ).toBe(true);
    expect(data.events.map((e) => e.kind).sort()).toEqual(
      expect.arrayContaining(['aula', 'trabalho', 'compromisso']),
    );
    expect(
      data.attendance.some((a) => a.cancelled) && data.attendance.some((a) => a.missed > 0),
    ).toBe(true);
    expect(
      data.reminders.some((r) => r.done) && data.reminders.some((r) => !r.done && r.date < today),
    ).toBe(true);
  });

  it('cartões: vencidos, futuros, cloze já expandido e imagens registradas', () => {
    expect(
      data.cards.some((c) => c.due < today) &&
        data.cards.some((c) => c.due === today) &&
        data.cards.some((c) => c.due > today),
    ).toBe(true);
    const cloze = data.cards.filter((c) => hasCloze(c.question));
    expect(cloze.length).toBeGreaterThan(2);
    expect(cloze.every((c) => !c.question.includes('{{c2::'))).toBe(true);
    const images = new Set(ids(data.cardImages));
    const used = data.cards.flatMap((c) =>
      [...c.answer.matchAll(/\{img:([\w-]+)\}/g)].map((m) => m[1] ?? ''),
    );
    expect(used.length).toBeGreaterThan(0);
    expect(used.every((id) => images.has(id))).toBe(true);
  });
});
