import { describe, expect, it } from 'vitest';
import {
  bimesterResult,
  copyScheme,
  defaultScheme,
  formatGrade,
  neededInSecondSemester,
  parseGrade,
  semesterResult,
  statusOf,
  yearResult,
  type Item,
  type Scheme,
} from './grades';

const scheme = defaultScheme('s1');
let counter = 0;
function item(bimester: 1 | 2 | 3 | 4, grade: number | null, extra: Partial<Item> = {}): Item {
  counter += 1;
  return {
    id: `i${counter}`,
    subjectId: 's1',
    bimester,
    name: 'Prova',
    weight: 1,
    grade,
    examId: null,
    replaces: null,
    bonus: 0,
    ...extra,
  };
}

describe('média do bimestre', () => {
  it('é a média ponderada dos itens com nota', () => {
    const items = [item(1, 8, { weight: 3 }), item(1, 6, { weight: 7 })];
    expect(bimesterResult(items, scheme, 1)).toEqual({ value: 6.6, partial: false });
  });

  it('pendente não vale zero: fica fora e a média sai parcial', () => {
    const result = bimesterResult([item(1, 8), item(1, null)], scheme, 1);
    expect(result).toEqual({ value: 8, partial: true });
  });

  it('sem nenhuma nota não há média', () => {
    expect(bimesterResult([item(1, null)], scheme, 1).value).toBeNull();
    expect(bimesterResult([], scheme, 1).value).toBeNull();
  });

  it('ignora itens de outro bimestre', () => {
    expect(bimesterResult([item(1, 10), item(2, 2)], scheme, 2).value).toBe(2);
  });
});

describe('reposição', () => {
  it('ocupa o lugar da original quando tem nota', () => {
    const original = item(1, 3, { id: 'orig' });
    const items = [original, item(1, 9, { replaces: 'orig' }), item(1, 7)];
    expect(bimesterResult(items, scheme, 1)).toEqual({ value: 8, partial: false });
  });

  it('enquanto a reposição está pendente, a original continua valendo', () => {
    const original = item(1, 3, { id: 'orig' });
    const result = bimesterResult([original, item(1, null, { replaces: 'orig' })], scheme, 1);
    expect(result).toEqual({ value: 3, partial: true });
  });
});

describe('bônus com teto', () => {
  it('no item, no bimestre e no semestre, sempre limitado a 10', () => {
    const itemBonus = bimesterResult([item(1, 9, { bonus: 2 })], scheme, 1);
    expect(itemBonus.value).toBe(10);

    const withBimester: Scheme = { ...scheme, bonusBimester: [0.5, 0, 0, 0] };
    expect(bimesterResult([item(1, 7)], withBimester, 1).value).toBe(7.5);
    expect(bimesterResult([item(1, 9.8)], withBimester, 1).value).toBe(10);

    const withSemester: Scheme = { ...scheme, bonusSemester: [1, 0] };
    expect(semesterResult([item(1, 7), item(2, 7)], withSemester, 1).value).toBe(8);
    expect(semesterResult([item(1, 9.5), item(2, 9.5)], withSemester, 1).value).toBe(10);
  });

  it('o teto é editável', () => {
    const low: Scheme = { ...scheme, cap: 8 };
    expect(bimesterResult([item(1, 7, { bonus: 3 })], low, 1).value).toBe(8);
  });
});

describe('semestre e ano', () => {
  it('semestre soma os bimestres pelos pesos (30/70)', () => {
    const custom: Scheme = { ...scheme, bimester1: [30, 50] };
    const items = [item(1, 10), item(2, 5)];
    expect(semesterResult(items, custom, 1)).toEqual({ value: 6.5, partial: false });
  });

  it('semestre com bimestre sem nota é parcial e usa só o que existe', () => {
    expect(semesterResult([item(1, 8)], scheme, 1)).toEqual({ value: 8, partial: true });
  });

  it('o ano soma os semestres pelos pesos e decide a aprovação', () => {
    const items = [item(1, 8), item(2, 8), item(3, 6), item(4, 6)];
    const year = yearResult(items, scheme);
    expect(year).toEqual({ value: 7, partial: false });
    expect(statusOf(year, 7)).toBe('aprovado');
    expect(statusOf({ value: 6.9, partial: false }, 7)).toBe('abaixo');
    expect(statusOf({ value: 9, partial: true }, 7)).toBe('em-andamento');
    expect(statusOf({ value: null, partial: true }, 7)).toBe('sem-notas');
  });

  it('pesos dos semestres 40/60', () => {
    const custom: Scheme = { ...scheme, semester1: 40 };
    const items = [item(1, 10), item(2, 10), item(3, 5), item(4, 5)];
    expect(yearResult(items, custom).value).toBe(7);
  });
});

describe('preciso de X', () => {
  const first = [item(1, 8), item(2, 8)];

  it('com o padrão é 2 × mínimo − média do 1º semestre', () => {
    expect(neededInSecondSemester(first, scheme)).toEqual({ kind: 'precisa', value: 6 });
  });

  it('extremo alto: acima de 10 não dá para chegar', () => {
    expect(neededInSecondSemester([item(1, 3), item(2, 3)], scheme)).toEqual({
      kind: 'impossivel',
    });
  });

  it('extremo baixo: nunca mostra menos que 0', () => {
    const low: Scheme = { ...scheme, min: 4 };
    expect(neededInSecondSemester([item(1, 10), item(2, 10)], low)).toEqual({
      kind: 'precisa',
      value: 0,
    });
  });

  it('sem nota no 1º semestre não há conta', () => {
    expect(neededInSecondSemester([], scheme)).toEqual({ kind: 'sem-dados' });
  });

  it('respeita pesos diferentes', () => {
    const custom: Scheme = { ...scheme, semester1: 40 };
    const needed = neededInSecondSemester(first, custom);
    expect(needed.kind === 'precisa' && needed.value).toBeCloseTo(6.333, 3);
  });
});

describe('esquema', () => {
  it('copiar leva as regras e troca a matéria', () => {
    const base: Scheme = { ...scheme, min: 6, semester1: 30 };
    const copy = copyScheme(base, 's2');
    expect(copy).toEqual({ ...base, subjectId: 's2' });
  });
});

describe('texto da nota', () => {
  it('formata com vírgula e aceita vírgula ou ponto', () => {
    expect(formatGrade(7)).toBe('7,0');
    expect(formatGrade(null)).toBe('—');
    expect(parseGrade('8,5')).toBe(8.5);
    expect(parseGrade('8.5')).toBe(8.5);
    expect(parseGrade('')).toBeNull();
    expect(parseGrade('11')).toBeUndefined();
    expect(parseGrade('abc')).toBeUndefined();
  });
});
