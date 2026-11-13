import { KEYS, type KeyGroup, type KeyRow } from './keys';
import type { Screen } from './actions';

export interface HelpSection {
  group: KeyGroup;
  rows: readonly KeyRow[];
}

export function helpSections(keys: readonly KeyRow[] = KEYS): HelpSection[] {
  const groups = [...new Set(keys.map((key) => key.group))];
  return groups.map((group) => ({ group, rows: keys.filter((key) => key.group === group) }));
}

// Lista as combinações repetidas: code + modificadores + nível só pode aparecer uma vez.
export function findConflicts(keys: readonly KeyRow[] = KEYS): string[] {
  const seen = new Set<string>();
  const conflicts: string[] = [];
  for (const key of keys) {
    for (const level of key.levels) {
      const id = `${key.mods}:${key.code}:${level}`;
      if (seen.has(id)) conflicts.push(id);
      seen.add(id);
    }
  }
  return conflicts;
}

export type HelpTab = 'screen' | 'universal' | 'all';

export interface HelpLine {
  group: KeyGroup;
  text: string;
  labels: string[];
  screens: KeyRow['screens'];
}

const GROUPED_TEXT: Readonly<Record<string, string>> = {
  moveFocus: 'Move o foco entre blocos',
  swapBlock: 'Troca o bloco com o vizinho',
  rateCard: 'Avalia o cartão: Errei, Difícil, Bom, Fácil',
};
const STEP_TEXT = 'Vai ao bloco vizinho ou ao próximo item';

// Teclas que fazem a mesma coisa (Alt H J K L e setas) viram uma linha só: "Alt H J K L", "Alt ← ↓ ↑ →".
function joinLabels(labels: readonly string[]): string[] {
  const by = new Map<string, string[]>();
  for (const label of labels) {
    const parts = label.split(' ');
    const last = parts.pop() ?? '';
    const id = `${parts.join(' ')}|${/^[A-Z0-9]$/.test(last) ? 'l' : 's'}`;
    by.set(id, [...(by.get(id) ?? []), last]);
  }
  return [...by].map(([id, lasts]) => [id.split('|')[0], ...lasts].filter(Boolean).join(' '));
}

export function helpLines(keys: readonly KeyRow[] = KEYS): HelpLine[] {
  const map = new Map<string, HelpLine & { raw: string[] }>();
  for (const key of keys) {
    const step = 'step' in key.action && key.action.step === true && key.action.type === 'moveFocus';
    const text = step ? STEP_TEXT : (GROUPED_TEXT[key.action.type] ?? key.text);
    const id = `${key.group}|${text}`;
    const line = map.get(id) ?? { group: key.group, text, labels: [], screens: key.screens, raw: [] };
    line.raw.push(key.label);
    map.set(id, line);
  }
  const joinable = new Set([...Object.values(GROUPED_TEXT), STEP_TEXT]);
  return [...map.values()].map(({ raw, ...line }) => ({
    ...line,
    labels: raw.length > 1 && joinable.has(line.text) ? joinLabels(raw) : raw,
  }));
}

export function linesOf(tab: HelpTab, screen: Screen, lines: readonly HelpLine[] = helpLines()): HelpLine[] {
  if (tab === 'all') return [...lines];
  if (tab === 'universal') return lines.filter((line) => line.screens === 'all');
  return lines.filter((line) => line.screens !== 'all' && line.screens.includes(screen));
}

export function groupLines(lines: readonly HelpLine[]): { group: KeyGroup; lines: HelpLine[] }[] {
  const groups = [...new Set(lines.map((line) => line.group))];
  return groups.map((group) => ({ group, lines: lines.filter((line) => line.group === group) }));
}
