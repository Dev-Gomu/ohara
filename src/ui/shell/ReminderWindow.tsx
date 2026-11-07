import { useState, type FormEvent } from 'react';
import { Window } from '../components/Window';
import { dispatch } from '../keyboard/store';
import { storage, today } from '../study/study';
import styles from './Palette.module.css';

export function ReminderWindow() {
  const [text, setText] = useState('');

  function save(event: FormEvent) {
    event.preventDefault();
    const clean = text.trim();
    if (clean === '') return;
    const reminder = { id: crypto.randomUUID(), text: clean, date: today, done: false };
    storage.write((data) => ({ ...data, reminders: [...data.reminders, reminder] }));
    setText('');
    dispatch({ type: 'escape' });
  }

  return (
    <Window id="reminder" title="Lembrete rápido" testId="lembrete">
      <form onSubmit={save}>
        <input
          className={styles.busca}
          aria-label="Lembrete"
          autoFocus
          placeholder="Lembrar de…"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </form>
    </Window>
  );
}
