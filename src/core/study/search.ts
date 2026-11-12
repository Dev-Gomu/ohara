import type { StudyData } from './types';

export type SearchKind = 'materia' | 'aula' | 'cartao';

export interface SearchResult {
  kind: SearchKind;
  id: string;
  title: string;
  detail: string;
  // Matéria abre a própria matéria; aula e cartão abrem a aula na Mesa.
  target: string;
}

const LIMIT = 40;

// Sem acento e sem caixa: "imunologia" acha "Imunologia", e "ate" acha "Atenção".
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase();
}

export function search(data: StudyData, query: string): SearchResult[] {
  const term = normalize(query.trim());
  if (term === '') return [];
  const has = (text: string) => normalize(text).includes(term);
  const subjectName = (id: string) => data.subjects.find((item) => item.id === id)?.name ?? '';
  const subjects = data.subjects
    .filter((subject) => has(subject.name) || has(subject.code))
    .map((subject) => ({
      kind: 'materia' as const,
      id: subject.id,
      title: subject.name,
      detail: 'Matéria',
      target: subject.id,
    }));
  const lessons = data.lessons
    .filter((lesson) => has(lesson.title))
    .map((lesson) => ({
      kind: 'aula' as const,
      id: lesson.id,
      title: lesson.title,
      detail: `Aula de ${subjectName(lesson.subjectId)}`,
      target: lesson.id,
    }));
  const cards = data.cards
    .filter((card) => has(card.question) || has(card.answer))
    .map((card) => ({
      kind: 'cartao' as const,
      id: card.id,
      title: card.question,
      detail: `Cartão: ${card.answer}`,
      target: card.lessonId,
    }));
  return [...subjects, ...lessons, ...cards].slice(0, LIMIT);
}
