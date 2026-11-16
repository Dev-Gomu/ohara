import { RETENTION } from '../../../core/study/fsrs';
import {
  newLimitOf,
  OPTIMIZE_MIN_REVIEWS,
  retentionOf,
  setNewLimit,
  setRetention,
  setWeights,
  weightsOf,
} from '../../../core/study/train';
import { storage } from '../../study/study';
import type { Choice, Row } from './configsData';

const percent = (value: number): number => Math.round(value * 100);

// Régua de 80% a 97%, passo de 1% (Etapa 11). O valor vai ao banco e sincroniza.
const STEPS = Array.from({ length: percent(RETENTION.max) - percent(RETENTION.min) + 1 }, (_, n) => {
  const value = percent(RETENTION.min) + n;
  return { id: String(value), name: `${value}%` };
});

// Novos por dia: 0 a 100 de 5 em 5, e "Sem limite" no fim.
const LIMITS = [
  ...Array.from({ length: 21 }, (_, n) => ({ id: String(n * 5), name: String(n * 5) })),
  { id: 'none', name: 'Sem limite' },
];

function stepRow(label: string, detail: string, choice: Choice): Row {
  const next = choice.options[choice.options.findIndex((step) => step.id === choice.current) + 1];
  return {
    label,
    detail,
    choice,
    run: () => {
      if (next) choice.set(next.id);
    },
  };
}

function newLimitRow(): Row {
  const limit = newLimitOf(storage.read());
  return stepRow('Novos por dia', 'Quantos cartões novos entram no Treino a cada dia.', {
    look: 'passo',
    options: LIMITS,
    current: limit === null ? 'none' : String(limit),
    set: (id) => storage.write((data) => setNewLimit(data, id === 'none' ? null : Number(id))),
  });
}

export function trainingRows(): Row[] {
  const choice: Choice = {
    look: 'passo',
    options: STEPS,
    current: String(percent(retentionOf(storage.read()))),
    set: (id) => storage.write((data) => setRetention(data, Number(id) / 100)),
  };
  return [stepRow('Retenção desejada', 'Maior retenção: mais revisões por dia.', choice), newLimitRow(), optimizerRow()];
}

// Otimizador (B06, D185): por ora só conta as respostas e guarda os pesos; o cálculo vem depois.
function optimizerRow(): Row {
  const data = storage.read();
  const answers = data.reviews.length;
  const adjusted = weightsOf(data) !== undefined;
  const count = `${answers.toLocaleString('pt-BR')} de ${OPTIMIZE_MIN_REVIEWS.toLocaleString('pt-BR')} respostas`;
  return {
    label: 'Ajuste à sua memória',
    detail: adjusted
      ? 'Usando parâmetros ajustados. Enter volta ao padrão.'
      : `O FSRS usa parâmetros médios. Com mais respostas, ele poderá se ajustar a você (${count}).`,
    value: adjusted ? 'Ajustado' : 'Padrão',
    ...(adjusted ? { run: () => storage.write((current) => setWeights(current, null)) } : {}),
  };
}
