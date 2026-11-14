import { describe, expect, it } from 'vitest';
import { removeCard, removeFolder, removeLesson, removeSubject } from './edit';
import { createFixtures } from './fixtures';
import {
  addedBetween,
  expired,
  markAll,
  markFrom,
  nextTrash,
  removedBetween,
  restorePlan,
  withoutItems,
  withRestored,
  type Trashed,
} from './trash';
import { leavesText, plainCard, supportText, trashEntries } from './trashList';
import type { StudyData } from './types';

const TODAY = '2026-11-14';
const NOW = new Date('2026-11-14T12:00:00Z');
const AT = '2026-11-14T10:00:00.000Z';

function remove(
  data: StudyData,
  trash: readonly Trashed[],
  root: string,
  change: (data: StudyData) => StudyData,
  at = AT,
): [StudyData, Trashed[]] {
  const after = change(data);
  return [after, nextTrash(trash, [], removedBetween(data, after, markAll(root, at), at))];
}

const base = createFixtures(TODAY);
const lesson = base.lessons.find((item) => base.cards.some((card) => card.lessonId === item.id))!;
const lessonCards = base.cards.filter((card) => card.lessonId === lesson.id);

describe('Lixeira: o que vai junto', () => {
  it('excluir a aula marca a aula e os cartões com a mesma raiz', () => {
    const [, trash] = remove(base, [], lesson.id, (data) => removeLesson(data, lesson.id));
    expect(trash.every((entry) => entry.by === lesson.id)).toBe(true);
    expect(trash.filter((entry) => entry.table === 'cards')).toHaveLength(lessonCards.length);
  });

  it('a lista mostra só a raiz, com o que volta junto', () => {
    const [data, trash] = remove(base, [], lesson.id, (d) => removeLesson(d, lesson.id));
    const entries = trashEntries(trash, data, NOW);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.kind).toBe('aula');
    expect(entries[0]!.brings).toContain(`${lessonCards.length} cart`);
    expect(entries[0]!.subject?.code).toBe(
      base.subjects.find((s) => s.id === lesson.subjectId)?.code,
    );
  });

  it('restaurar a aula traz de volta os cartões, e a Lixeira esvazia', () => {
    const [data, trash] = remove(base, [], lesson.id, (d) => removeLesson(d, lesson.id));
    const plan = restorePlan(trash, lesson.id);
    const back = withRestored(data, plan);
    expect(back.cards.filter((card) => card.lessonId === lesson.id)).toHaveLength(
      lessonCards.length,
    );
    expect(nextTrash(trash, addedBetween(data, back), [])).toHaveLength(0);
  });

  it('cartão excluído antes, sozinho, continua item próprio', () => {
    const card = lessonCards[0]!;
    const [d1, t1] = remove(base, [], card.id, (d) => removeCard(d, card.id));
    const [d2, t2] = remove(d1, t1, lesson.id, (d) => removeLesson(d, lesson.id));
    expect(
      trashEntries(t2, d2, NOW)
        .map((entry) => entry.id)
        .sort(),
    ).toEqual([card.id, lesson.id].sort());
    expect(restorePlan(t2, lesson.id).some((entry) => entry.item.id === card.id)).toBe(false);
  });

  it('pai na Lixeira volta junto: restaurar o cartão restaura a aula', () => {
    const card = lessonCards[0]!;
    const [d1, t1] = remove(base, [], card.id, (d) => removeCard(d, card.id));
    const [d2, t2] = remove(d1, t1, lesson.id, (d) => removeLesson(d, lesson.id));
    const plan = restorePlan(t2, card.id);
    expect(plan.some((entry) => entry.item.id === lesson.id)).toBe(true);
    const entry = trashEntries(t2, d2, NOW).find((item) => item.id === card.id)!;
    expect(entry.parents).toEqual([lesson.title]);
  });

  it('pasta volta sozinha: as aulas ficaram vivas, sem pasta (D92)', () => {
    const folder = base.folders.find((item) => base.lessons.some((l) => l.folderId === item.id))!;
    const [data, trash] = remove(base, [], folder.id, (d) => removeFolder(d, folder.id));
    expect(trash).toHaveLength(1);
    const back = withRestored(data, restorePlan(trash, folder.id));
    expect(back.folders.some((item) => item.id === folder.id)).toBe(true);
    expect(back.lessons.some((item) => item.folderId === folder.id)).toBe(false);
  });

  it('matéria leva pastas, aulas, cartões e provas; restaurar traz tudo', () => {
    const id = lesson.subjectId;
    const [data, trash] = remove(base, [], id, (d) => removeSubject(d, id));
    expect(trashEntries(trash, data, NOW)).toHaveLength(1);
    const back = withRestored(data, restorePlan(trash, id));
    expect(back.lessons.filter((item) => item.subjectId === id)).toHaveLength(
      base.lessons.filter((item) => item.subjectId === id).length,
    );
    expect(back.exams.length).toBe(base.exams.length);
  });

  it('desfazer o restaurar devolve à Lixeira com a raiz e a data de antes', () => {
    const [data, trash] = remove(
      base,
      [],
      lesson.id,
      (d) => removeLesson(d, lesson.id),
      '2026-11-01T00:00:00.000Z',
    );
    const plan = restorePlan(trash, lesson.id);
    const back = withRestored(data, plan);
    const again = removedBetween(back, withoutItems(back, plan), markFrom(plan), AT);
    expect(
      again.every((entry) => entry.by === lesson.id && entry.at === '2026-11-01T00:00:00.000Z'),
    ).toBe(true);
  });
});

describe('Lixeira: prazo', () => {
  it('limpa o que passou de 30 dias e só isso', () => {
    const [, old] = remove(
      base,
      [],
      lesson.id,
      (d) => removeLesson(d, lesson.id),
      '2026-10-14T11:00:00.000Z',
    );
    expect(expired(old, NOW).length).toBe(old.length);
    const [, fresh] = remove(
      base,
      [],
      lesson.id,
      (d) => removeLesson(d, lesson.id),
      '2026-10-16T11:00:00.000Z',
    );
    expect(expired(fresh, NOW)).toHaveLength(0);
  });

  it('avisa só nos últimos 7 dias', () => {
    expect(leavesText(8)).toBeNull();
    expect(leavesText(7)).toBe('some em 7 d');
    expect(leavesText(0)).toBe('some hoje');
  });

  it('texto de apoio: tipo, quando e o que volta', () => {
    const [data, trash] = remove(
      base,
      [],
      lesson.id,
      (d) => removeLesson(d, lesson.id),
      '2026-11-11T10:00:00.000Z',
    );
    const text = supportText(trashEntries(trash, data, NOW)[0]!, true);
    expect(text.startsWith('Aula · excluída há 3 d · volta com')).toBe(true);
  });

  it('cartão aparece pela primeira linha, sem imagem e sem a marca da lacuna', () => {
    expect(plainCard('{img:abc}\nO {{c1::timo::órgão}} amadurece')).toBe('O timo amadurece');
  });
});
