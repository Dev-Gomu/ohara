import { currentCardView, setColorTitles, setCompact } from '../../study/cardView';
import { currentTopAnimation, setTopAnimation, TOP_ANIMATION_NAMES, type TopAnimation } from '../../shell/topAnimation';
import { currentTopTabs, setTopTabs, TOP_TABS_NAMES, type TopTabs } from '../../shell/topTabs';
import {
  applyCorners,
  applyPalette,
  CORNER_NAMES,
  currentCorners,
  currentPalette,
  currentTheme,
  PALETTE_NAMES,
  setTheme,
  type Corners,
  type Palette,
  type Theme,
} from '../../theme';
import type { Choice, Row } from './configsData';

const optionsOf = <T extends string>(names: Readonly<Record<T, string>>) =>
  (Object.keys(names) as T[]).map((id) => ({ id, name: names[id] }));

function choice<T extends string>(
  look: Choice['look'],
  names: Readonly<Record<T, string>>,
  current: T,
  set: (id: T) => void,
): Choice {
  return { look, options: optionsOf(names), current, set: (id) => set(id as T) };
}

// Enter passa à próxima opção, voltando à primeira no fim.
const cycle = (c: Choice) => () => {
  const at = c.options.findIndex((option) => option.id === c.current);
  const next = c.options[(at + 1) % c.options.length];
  if (next) c.set(next.id);
};

function row(group: string | undefined, label: string, detail: string, c: Choice): Row {
  return { ...(group ? { group } : {}), label, detail, choice: c, run: cycle(c) };
}

const THEMES: Readonly<Record<Theme, string>> = { claro: 'Claro', escuro: 'Escuro' };
const SIZES = { padrao: 'Padrão', compacto: 'Compacto' } as const;
const TITLES = { sim: 'Com cor', nao: 'Sem cor' } as const;

export function appearanceRows(): Row[] {
  const card = currentCardView();
  return [
    row('Cores', 'Tema', 'Claro ou escuro, neste aparelho.', choice('curta', THEMES, currentTheme(), setTheme)),
    row(
      undefined,
      'Paleta de cores',
      'Muda os azuis e as cores das matérias.',
      choice<Palette>('paleta', PALETTE_NAMES, currentPalette(), applyPalette),
    ),
    row(
      undefined,
      'Cantos',
      'Mais redondos ou mais retos.',
      choice<Corners>('curta', CORNER_NAMES, currentCorners(), applyCorners),
    ),
    row(
      'Barra do topo',
      'Menu de telas',
      'Como as abas das telas aparecem.',
      choice<TopTabs>('menu', TOP_TABS_NAMES, currentTopTabs(), setTopTabs),
    ),
    row(
      undefined,
      'Animação na troca de tela',
      'Elástico ou nenhuma.',
      choice<TopAnimation>('curta', TOP_ANIMATION_NAMES, currentTopAnimation(), setTopAnimation),
    ),
    row(
      'Cartões',
      'Tamanho do cartão',
      'Compacto cabe mais texto no verso.',
      choice('curta', SIZES, card.compact ? 'compacto' : 'padrao', (id) => setCompact(id === 'compacto')),
    ),
    row(
      undefined,
      'Cor nos títulos',
      'Títulos do verso na cor de ação.',
      choice('curta', TITLES, card.colorTitles ? 'sim' : 'nao', (id) => setColorTitles(id === 'sim')),
    ),
  ];
}
