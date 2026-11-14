// Cartão cloze (D157): a frase traz lacunas escritas como no Anki, "{{c1::resposta}}".
// Cada número vira um cartão; no cartão guardado só resta a lacuna da vez, sempre como "c1".

const PATTERN = /\{\{c(\d+)::(.+?)(?:::(.*?))?\}\}/g;

export const hasCloze = (text: string): boolean => new RegExp(PATTERN.source).test(text);

export function clozeNumbers(text: string): number[] {
  const numbers = new Set<number>();
  for (const found of text.matchAll(PATTERN)) numbers.add(Number(found[1]));
  return [...numbers].sort((a, b) => a - b);
}

export interface ClozePart {
  text: string;
  // "hole" é a lacuna escondida; "answer" é a resposta já revelada.
  kind: 'plain' | 'hole' | 'answer';
}

// Divide a frase em trechos. `reveal` mostra as respostas; senão as lacunas viram "[…]" (a dica fica de fora).
export function clozeParts(text: string, reveal: boolean): ClozePart[] {
  const parts: ClozePart[] = [];
  let last = 0;
  for (const found of text.matchAll(PATTERN)) {
    if (found.index > last) parts.push({ text: text.slice(last, found.index), kind: 'plain' });
    parts.push(reveal ? { text: found[2] ?? '', kind: 'answer' } : { text: '[…]', kind: 'hole' });
    last = found.index + found[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), kind: 'plain' });
  return parts;
}

// Uma frase por número: as outras lacunas viram texto comum e a da vez fica como "c1".
export function expandCloze(text: string): string[] {
  return clozeNumbers(text).map((number) =>
    text.replace(PATTERN, (_all, n: string, answer: string) =>
      Number(n) === number ? `{{c1::${answer}}}` : answer,
    ),
  );
}
