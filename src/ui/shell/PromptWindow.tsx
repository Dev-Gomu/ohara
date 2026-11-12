import { useState, type FormEvent } from 'react';
import { Window } from '../components/Window';
import { dispatch } from '../keyboard/store';
import { setScreenMemory, useScreenMemory } from '../study/screenMemory';
import styles from './PromptWindow.module.css';

export interface PromptField {
  id: string;
  label: string;
  value?: string;
  type?: 'text' | 'date' | 'time' | 'area' | 'password';
  options?: readonly { value: string; label: string }[];
}

export interface Prompt {
  title: string;
  action: string;
  fields: readonly PromptField[];
  onSubmit: (values: Readonly<Record<string, string>>) => void;
}

const KEY = 'janela.pergunta';

// Formulário curto de qualquer tela. Enter envia, Esc cancela.
export function ask(prompt: Prompt): void {
  setScreenMemory(KEY, prompt);
  dispatch({ type: 'openWindow', window: 'prompt' });
}

function Form({ prompt }: { prompt: Prompt }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(prompt.fields.map((field) => [field.id, field.value ?? ''])),
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    if (Object.values(values).some((value) => value.trim() === '')) return;
    dispatch({ type: 'escape' });
    prompt.onSubmit(values);
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      {prompt.fields.map((field, index) => (
        <label key={field.id} className={styles.campo}>
          <span className={styles.rotulo}>{field.label}</span>
          {field.options ? (
            <select
              className={styles.entrada}
              autoFocus={index === 0}
              value={values[field.id] ?? ''}
              onChange={(event) => setValues({ ...values, [field.id]: event.target.value })}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === 'area' ? (
            <textarea
              className={`${styles.entrada} ${styles.area}`}
              autoFocus={index === 0}
              rows={5}
              value={values[field.id] ?? ''}
              onChange={(event) => setValues({ ...values, [field.id]: event.target.value })}
            />
          ) : (
            <input
              className={styles.entrada}
              type={field.type ?? 'text'}
              autoFocus={index === 0}
              value={values[field.id] ?? ''}
              onChange={(event) => setValues({ ...values, [field.id]: event.target.value })}
            />
          )}
        </label>
      ))}
      <button type="submit" className={styles.enviar}>
        {prompt.action} <kbd className={styles.tecla}>Enter</kbd>
      </button>
    </form>
  );
}

export function PromptWindow() {
  const [prompt] = useScreenMemory<Prompt | null>(KEY, null);
  return (
    <Window id="prompt" title={prompt?.title ?? ''} testId="pergunta">
      {prompt && <Form key={prompt.title} prompt={prompt} />}
    </Window>
  );
}
