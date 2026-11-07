import { describe, expect, it } from 'vitest';
import { createFixtures } from './fixtures';
import {
  editCard,
  editLesson,
  removeCard,
  removeFolder,
  removeLesson,
  removeSubject,
  renameFolder,
  renameSubject,
  restoreRemoved,
} from './edit';

const data = createFixtures('2026-11-07');
const subject = data.subjects[0];
const lesson = data.lessons.find((item) => item.folderId !== null);
if (!subject || !lesson) throw new Error('fixtures sem matéria ou aula');

describe('renomear e editar', () => {
  it('renomear matéria refaz a sigla', () => {
    const next = renameSubject(data, subject.id, 'Zoologia');
    expect(next.subjects.find((item) => item.id === subject.id)).toMatchObject({
      name: 'Zoologia',
      code: 'ZOO',
    });
  });

  it('renomear pasta', () => {
    const folder = data.folders[0];
    if (!folder) throw new Error('sem pasta');
    expect(renameFolder(data, folder.id, 'Novo').folders[0]?.name).toBe('Novo');
  });

  it('editar aula acompanha a Agenda', () => {
    const event = data.events.find((item) => item.lessonId === lesson.id);
    const next = editLesson(data, lesson.id, 'Outro título', '2026-12-01');
    expect(next.lessons.find((item) => item.id === lesson.id)?.title).toBe('Outro título');
    if (event) {
      expect(next.events.find((item) => item.id === event.id)).toMatchObject({
        title: 'Outro título',
        date: '2026-12-01',
      });
    }
  });

  it('editar cartão', () => {
    const card = data.cards[0];
    if (!card) throw new Error('sem cartão');
    expect(editCard(data, card.id, 'P', 'R').cards[0]).toMatchObject({
      question: 'P',
      answer: 'R',
    });
  });
});

describe('excluir', () => {
  it('cartão', () => {
    const card = data.cards[0];
    if (!card) throw new Error('sem cartão');
    expect(removeCard(data, card.id).cards.some((item) => item.id === card.id)).toBe(false);
  });

  it('aula leva os cartões e solta a Agenda', () => {
    const next = removeLesson(data, lesson.id);
    expect(next.lessons.some((item) => item.id === lesson.id)).toBe(false);
    expect(next.cards.some((item) => item.lessonId === lesson.id)).toBe(false);
    expect(next.events.some((item) => item.lessonId === lesson.id)).toBe(false);
  });

  it('pasta mantém as aulas, sem pasta', () => {
    const folderId = lesson.folderId ?? '';
    const next = removeFolder(data, folderId);
    expect(next.folders.some((item) => item.id === folderId)).toBe(false);
    expect(next.lessons.find((item) => item.id === lesson.id)?.folderId).toBeNull();
  });

  it('matéria leva tudo o que é dela e nada de outra', () => {
    const next = removeSubject(data, subject.id);
    expect(next.subjects.some((item) => item.id === subject.id)).toBe(false);
    for (const key of ['folders', 'lessons', 'exams', 'events', 'slots'] as const) {
      expect(next[key].some((item) => item.subjectId === subject.id)).toBe(false);
    }
    const ids = new Set(next.lessons.map((item) => item.id));
    expect(next.cards.every((item) => ids.has(item.lessonId))).toBe(true);
    expect(next.subjects.length).toBe(data.subjects.length - 1);
  });
});

describe('desfazer', () => {
  it('traz tudo de volta, na mesma ordem', () => {
    const after = removeSubject(data, subject.id);
    expect(restoreRemoved(after, data, after)).toEqual(data);
  });

  it('desfaz a pasta e devolve as aulas a ela', () => {
    const folderId = lesson.folderId ?? '';
    const after = removeFolder(data, folderId);
    expect(restoreRemoved(after, data, after)).toEqual(data);
  });

  it('não desfaz o que o usuário fez depois', () => {
    const after = removeLesson(data, lesson.id);
    const other = after.lessons[0];
    if (!other) throw new Error('sem outra aula');
    const later = {
      ...after,
      lessons: after.lessons.map((item) => (item === other ? { ...item, notes: 'novo' } : item)),
    };
    const back = restoreRemoved(later, data, after);
    expect(back.lessons.find((item) => item.id === other.id)?.notes).toBe('novo');
    expect(back.lessons.some((item) => item.id === lesson.id)).toBe(true);
  });
});
