import { RETENTION } from '../../../core/study/fsrs';
import { retentionOf, setRetention } from '../../../core/study/train';
import { storage } from '../../study/study';
import type { Choice, Row } from './configsData';

const percent = (value: number): number => Math.round(value * 100);

// Régua de 80% a 97%, passo de 1% (Etapa 11). O valor vai ao banco e sincroniza.
const STEPS = Array.from({ length: percent(RETENTION.max) - percent(RETENTION.min) + 1 }, (_, n) => {
  const value = percent(RETENTION.min) + n;
  return { id: String(value), name: `${value}%` };
});

export function trainingRows(): Row[] {
  const choice: Choice = {
    look: 'passo',
    options: STEPS,
    current: String(percent(retentionOf(storage.read()))),
    set: (id) => storage.write((data) => setRetention(data, Number(id) / 100)),
  };
  const next = STEPS[STEPS.findIndex((step) => step.id === choice.current) + 1];
  return [
    {
      label: 'Retenção desejada',
      detail: 'Maior retenção: mais revisões por dia.',
      choice,
      run: () => {
        if (next) choice.set(next.id);
      },
    },
  ];
}
