import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { PinSlots, type PinStatus } from '../components/PinSlots';
import { Window, WindowFooter } from '../components/Window';
import { dispatch } from '../keyboard/store';
import { showNotice } from '../study/notice';
import { setScreenMemory, useScreenMemory } from '../study/screenMemory';
import styles from './PromptWindow.module.css';

export interface PromptField {
  id: string;
  label: string;
  value?: string;
  type?: 'text' | 'date' | 'time' | 'area' | 'password' | 'pin';
  options?: readonly { value: string; label: string }[];
}

export interface Prompt {
  title: string;
  action: string;
  fields: readonly PromptField[];
  onSubmit: (values: Readonly<Record<string, string>>) => void;
  // Só com campo `pin`: confere assim que as casas enchem. Devolve o aviso de erro, ou null se abriu.
  verify?: (values: Readonly<Record<string, string>>) => Promise<string | null>;
  // Depois que o `verify` aceita e a janela fecha (ex.: mostrar o QR).
  onVerified?: (values: Readonly<Record<string, string>>) => void;
  // Conteúdo extra acima dos campos; `set` preenche um campo (ex.: texto lido do QR).
  body?: (set: (id: string, value: string) => void) => ReactNode;
}

const CLOSE_AFTER_OK_MS = 900;

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

  const [pinStatus, setPinStatus] = useState<PinStatus>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  function pinDone(id: string, code: string) {
    const next = { ...values, [id]: code };
    setValues(next);
    if (!prompt.verify) {
      // Sem conferência: pula para o próximo campo de PIN (ex.: "repita o PIN").
      const inputs = [...(formRef.current?.querySelectorAll('input') ?? [])];
      const here = inputs.findIndex((input) => input === document.activeElement);
      inputs[here + 1]?.focus();
      return;
    }
    void prompt.verify(next).then((problem) => {
      if (problem === null) {
        setPinStatus('success');
        setTimeout(() => {
          dispatch({ type: 'escape' });
          prompt.onVerified?.(next);
        }, CLOSE_AFTER_OK_MS);
      } else {
        setPinStatus('error');
        showNotice(problem);
      }
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (Object.values(values).some((value) => value.trim() === '')) return;
    dispatch({ type: 'escape' });
    prompt.onSubmit(values);
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={submit}>
      {prompt.body?.((id, value) => setValues((now) => ({ ...now, [id]: value })))}
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
          ) : field.type === 'pin' ? (
            <PinSlots
              autoFocus={index === 0}
              status={pinStatus}
              onChange={(code) => {
                setPinStatus('idle');
                setValues((now) => ({ ...now, [field.id]: code }));
              }}
              onComplete={(code) => pinDone(field.id, code)}
            />
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
      <WindowFooter>
        <button
          type="button"
          className={styles.cancelar}
          onClick={() => dispatch({ type: 'escape' })}
        >
          Cancelar
        </button>
        <button type="submit" className={styles.enviar}>
          {prompt.action}
        </button>
      </WindowFooter>
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
