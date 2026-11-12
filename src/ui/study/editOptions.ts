import {
  editCard,
  editLesson,
  removeCard,
  removeFolder,
  removeLesson,
  renameFolder,
} from '../../core/study/edit';
import type { Card, Lesson } from '../../core/study/types';
import type { BlockOption } from '../keyboard/store';
import { ask } from '../shell/PromptWindow';
import { storage } from './study';
import { removeWithUndo } from './undo';

export function folderOptions(folder: { id: string; name: string } | undefined): BlockOption[] {
  if (!folder) return [];
  return [
    {
      id: 'renomear',
      label: 'Renomear pasta',
      run: () =>
        ask({
          title: 'Renomear pasta',
          action: 'Salvar',
          fields: [{ id: 'name', label: 'Nome', value: folder.name }],
          onSubmit: ({ name }) => {
            if (name) storage.write((data) => renameFolder(data, folder.id, name.trim()));
          },
        }),
    },
    {
      id: 'excluir',
      label: 'Excluir pasta',
      run: () =>
        removeWithUndo(`Pasta "${folder.name}" excluída; as aulas ficaram sem pasta.`, (data) =>
          removeFolder(data, folder.id),
        ),
    },
  ];
}

export function lessonOptions(lesson: Lesson | undefined): BlockOption[] {
  if (!lesson) return [];
  return [
    {
      id: 'editar',
      label: 'Editar aula',
      run: () =>
        ask({
          title: 'Editar aula',
          action: 'Salvar',
          fields: [
            { id: 'title', label: 'Título', value: lesson.title },
            { id: 'date', label: 'Data', type: 'date', value: lesson.date },
          ],
          onSubmit: ({ title, date }) => {
            if (title && date)
              storage.write((data) => editLesson(data, lesson.id, title.trim(), date));
          },
        }),
    },
    {
      id: 'excluir',
      label: 'Excluir aula',
      run: () =>
        removeWithUndo(`Aula "${lesson.title}" excluída, com os cartões.`, (data) =>
          removeLesson(data, lesson.id),
        ),
    },
  ];
}

export function cardOptions(card: Card | undefined): BlockOption[] {
  if (!card) return [];
  return [
    {
      id: 'editar',
      label: 'Editar cartão',
      run: () =>
        ask({
          title: 'Editar cartão',
          action: 'Salvar',
          fields: [
            { id: 'question', label: 'Frente', value: card.question },
            { id: 'answer', label: 'Verso', type: 'area', value: card.answer },
          ],
          onSubmit: ({ question, answer }) => {
            if (question && answer) {
              storage.write((data) => editCard(data, card.id, question.trim(), answer.trim()));
            }
          },
        }),
    },
    {
      id: 'excluir',
      label: 'Excluir cartão',
      run: () => removeWithUndo('Cartão excluído.', (data) => removeCard(data, card.id)),
    },
  ];
}
