import { describe, expect, it } from 'vitest';
import { addCards, addFolder, addLesson, addSubject, nextColor, subjectCode } from './create';
import { createFixtures } from './fixtures';
import { folderTabs, lessonsOf } from './queries';

const data = createFixtures('2026-11-07');

describe('criar', () => {
  it('a sigla vem do nome, sem acento', () => {
    expect(subjectCode('Saúde Coletiva')).toBe('SAU');
    expect(subjectCode('Ética')).toBe('ETI');
  });

  it('a cor nova é a menos usada', () => {
    const subjects = data.subjects.filter((item) => item.color !== 3);
    expect(nextColor(subjects)).toBe(3);
  });

  it('matéria nova entra no ano pedido', () => {
    const next = addSubject(data, 'x', 'ano-2', 'Saúde Coletiva');
    expect(next.subjects.at(-1)).toMatchObject({ yearId: 'ano-2', code: 'SAU', lastAccess: null });
  });

  it('pasta nova entra antes de Sem bimestre', () => {
    const next = addFolder(data, 'x', 'imu', '4º bimestre');
    expect(folderTabs(next, 'imu').at(-2)?.name).toBe('4º bimestre');
  });

  it('aula nova aparece na matéria', () => {
    const next = addLesson(data, 'x', 'bio', null, 'Autonomia', '2026-11-07');
    expect(lessonsOf(next, 'bio').map((item) => item.title)).toEqual(['Autonomia']);
  });

  it('cartões novos entram na aula, vencidos hoje', () => {
    const drafts = [{ front: 'IL-6', back: 'Fígado' }];
    const next = addCards(data, 'imu-a7', drafts, ['novo'], '2026-11-07');
    expect(next.cards.at(-1)).toEqual({
      id: 'novo',
      lessonId: 'imu-a7',
      question: 'IL-6',
      answer: 'Fígado',
      due: '2026-11-07',
    });
  });
});
