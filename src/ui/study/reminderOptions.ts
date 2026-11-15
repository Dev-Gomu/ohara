import { addDays } from '../../core/study/dates';
import type { Reminder } from '../../core/study/types';
import type { BlockOption } from '../keyboard/store';
import { ask } from '../shell/PromptWindow';
import { postponeReminder } from './actions';
import { today } from './study';

// D178: o ⋮ do bloco Lembretes ganha "Adiar" para o lembrete sob o cursor.
export function reminderOptions(item: Reminder | undefined): BlockOption[] {
  if (!item) return [];
  return [
    {
      id: 'adiar-amanha',
      label: 'Adiar para amanhã',
      run: () => postponeReminder(item.id, addDays(today, 1)),
    },
    {
      id: 'adiar-dia',
      label: 'Adiar para outro dia…',
      run: () =>
        ask({
          title: 'Adiar lembrete',
          action: 'Adiar',
          fields: [{ id: 'date', label: 'Dia', type: 'date', value: addDays(today, 1) }],
          onSubmit: ({ date }) => {
            if (date && date > today) postponeReminder(item.id, date);
          },
        }),
    },
  ];
}
