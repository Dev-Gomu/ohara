import type { TableName } from '../db/specs';
import { ageDays, daysLeft, extraRoots, groupOf, WARN_DAYS, type Trashed } from './trash';
import type { StudyData, Subject } from './types';

export type TrashKind = 'materia' | 'pasta' | 'aula' | 'cartao' | 'prova' | 'anexo' | 'lembrete';

// Ordem da régua. `male`: "excluído" (cartão, anexo, lembrete) ou "excluída".
export const TRASH_KINDS: readonly {
  id: TrashKind;
  table: TableName;
  name: string;
  one: string;
  male: boolean;
}[] = [
  { id: 'materia', table: 'subjects', name: 'Matérias', one: 'Matéria', male: false },
  { id: 'pasta', table: 'folders', name: 'Pastas', one: 'Pasta', male: false },
  { id: 'aula', table: 'lessons', name: 'Aulas', one: 'Aula', male: false },
  { id: 'cartao', table: 'cards', name: 'Cartões', one: 'Cartão', male: true },
  { id: 'prova', table: 'exams', name: 'Provas', one: 'Prova', male: false },
  { id: 'anexo', table: 'files', name: 'Anexos', one: 'Anexo', male: true },
  { id: 'lembrete', table: 'reminders', name: 'Lembretes', one: 'Lembrete', male: true },
];

export interface TrashEntry {
  id: string;
  kind: TrashKind;
  title: string;
  subject: Pick<Subject, 'code' | 'color'> | null;
  at: string;
  age: number;
  left: number;
  // "9 cartões · anotações · slides": o que volta junto (vazio quando nada).
  brings: string;
  // Raízes que também voltam porque o pai do item está na Lixeira.
  parents: string[];
}

const str = (value: unknown): string => (typeof value === 'string' ? value : '');

// Primeira linha legível do cartão: sem linhas de imagem e com a resposta no lugar da lacuna.
export function plainCard(question: string): string {
  const lines = question
    .split('\n')
    .filter((line) => !/^\{img:[^}]+\}\s*$/.test(line))
    .map((line) => line.replace(/\{\{c\d+::(.*?)(?:::.*?)?\}\}/g, '$1').trim())
    .filter((line) => line !== '');
  return lines[0] ?? 'Cartão sem texto';
}

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

// Monta o "volta com" a partir do grupo, menos a própria raiz.
function bringsOf(group: readonly Trashed[], root: Trashed): string {
  const of = (table: TableName) => group.filter((entry) => entry !== root && entry.table === table);
  const parts: string[] = [];
  const add = (n: number, one: string, many: string) => n > 0 && parts.push(count(n, one, many));
  add(of('folders').length, 'pasta', 'pastas');
  add(of('lessons').length, 'aula', 'aulas');
  add(of('cards').length, 'cartão', 'cartões');
  const lessons = [root, ...of('lessons')].filter((entry) => entry.table === 'lessons');
  if (
    lessons.some(
      (entry) =>
        str(entry.item.notes)
          .replace(/<[^>]*>/g, '')
          .trim() !== '',
    )
  )
    parts.push('anotações');
  const files = of('files');
  if (files.some((entry) => entry.item.kind === 'slides')) parts.push('slides');
  add(files.filter((entry) => entry.item.kind !== 'slides').length, 'livro', 'livros');
  add(of('card_images').length, 'imagem', 'imagens');
  add(of('exams').length, 'prova', 'provas');
  if (of('slots').length > 0) parts.push('horários da Grade');
  add(of('events').length, 'item da Agenda', 'itens da Agenda');
  add(of('attendance').length, 'falta', 'faltas');
  return parts.join(' · ');
}

function find(
  data: StudyData,
  trash: readonly Trashed[],
  table: TableName,
  id: string,
): Record<string, unknown> | undefined {
  const live = { subjects: data.subjects, lessons: data.lessons }[
    table as 'subjects' | 'lessons'
  ] as readonly { id: string }[] | undefined;
  return (
    (live?.find((item) => item.id === id) as Record<string, unknown> | undefined) ??
    trash.find((entry) => entry.table === table && entry.item.id === id)?.item
  );
}

function subjectIdOf(data: StudyData, trash: readonly Trashed[], root: Trashed): string {
  if (root.table === 'subjects') return root.item.id;
  const own = str(root.item.subjectId);
  if (own !== '') return own;
  const lesson = str(root.item.lessonId);
  return lesson === '' ? '' : str(find(data, trash, 'lessons', lesson)?.subjectId);
}

function titleOf(root: Trashed, subject: Record<string, unknown> | undefined): string {
  const item = root.item;
  if (root.table === 'subjects' || root.table === 'folders' || root.table === 'files')
    return str(item.name);
  if (root.table === 'lessons') return str(item.title) || 'Aula sem título';
  if (root.table === 'cards') return plainCard(str(item.question));
  if (root.table === 'exams') return `Prova de ${str(subject?.name) || 'matéria'}`;
  return str(item.text);
}

// Só raízes dos tipos da régua aparecem; as mais recentes primeiro.
export function trashEntries(trash: readonly Trashed[], data: StudyData, now: Date): TrashEntry[] {
  const entries: TrashEntry[] = [];
  for (const root of trash) {
    const kind = TRASH_KINDS.find((item) => item.table === root.table);
    if (!kind || root.by !== root.item.id) continue;
    const subject = find(data, trash, 'subjects', subjectIdOf(data, trash, root));
    entries.push({
      id: root.item.id,
      kind: kind.id,
      title: titleOf(root, subject),
      subject: subject ? { code: str(subject.code), color: Number(subject.color) } : null,
      at: root.at,
      age: ageDays(root.at, now),
      left: daysLeft(root.at, now),
      brings: bringsOf(groupOf(trash, root.by), root),
      parents: extraRoots(trash, root.by).map((parent) =>
        titleOf(parent, find(data, trash, 'subjects', str(parent.item.subjectId))),
      ),
    });
  }
  return entries.sort((a, b) => b.at.localeCompare(a.at));
}

export const kindInfo = (kind: TrashKind) =>
  TRASH_KINDS.find((item) => item.id === kind) ?? TRASH_KINDS[0]!;

export const whenText = (age: number): string =>
  age === 0 ? 'hoje' : age === 1 ? 'ontem' : `há ${age} d`;

// Nos últimos 7 dias a linha avisa; antes disso, nada.
export function leavesText(left: number): string | null {
  if (left > WARN_DAYS) return null;
  return left === 0 ? 'some hoje' : `some em ${left} d`;
}

export function supportText(entry: TrashEntry, withKind: boolean): string {
  const info = kindInfo(entry.kind);
  const head = withKind ? `${info.one} · ` : '';
  const brings = entry.brings === '' ? '' : ` · volta com ${entry.brings}`;
  return `${head}${info.male ? 'excluído' : 'excluída'} ${whenText(entry.age)}${brings}`;
}
