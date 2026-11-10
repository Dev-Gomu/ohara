import { prefixed } from '../core/appInfo';

export type Theme = 'claro' | 'escuro';

// Preferência de aparelho, não dado: se o armazenamento falhar, vale o tema do sistema.
const KEY = prefixed('tema');

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'claro' || value === 'escuro' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

export function applyTheme(theme: Theme = storedTheme() ?? systemTheme()): void {
  document.documentElement.dataset.tema = theme;
}

export function toggleTheme(): void {
  const theme = document.documentElement.dataset.tema === 'escuro' ? 'claro' : 'escuro';
  applyTheme(theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Vale só até fechar o app.
  }
}

// 'original' é a Ardósia (tokens.css) e não põe atributo. ?paleta=a|b|original escolhe e fica guardada.
export type Palette = 'original' | 'a' | 'b';

const PALETTES: readonly Palette[] = ['original', 'a', 'b'];
const PALETTE_KEY = prefixed('paleta');

export const PALETTE_NAMES: Readonly<Record<Palette, string>> = {
  original: 'Ardósia',
  a: 'A · Azul-gelo',
  b: 'B · Cinza-índigo',
};

function asPalette(value: string | null): Palette | null {
  return PALETTES.find((item) => item === value) ?? null;
}

function storedPalette(): Palette {
  try {
    return asPalette(localStorage.getItem(PALETTE_KEY)) ?? 'original';
  } catch {
    return 'original';
  }
}

export function currentPalette(): Palette {
  return asPalette(document.documentElement.dataset.paleta ?? 'original') ?? 'original';
}

export function applyPalette(palette?: Palette): void {
  const fromUrl = asPalette(new URLSearchParams(window.location.search).get('paleta'));
  const chosen = palette ?? fromUrl ?? storedPalette();
  if (chosen === 'original') delete document.documentElement.dataset.paleta;
  else document.documentElement.dataset.paleta = chosen;
  try {
    localStorage.setItem(PALETTE_KEY, chosen);
  } catch {
    // Sem armazenamento, a escolha vale só até recarregar.
  }
}

export function cyclePalette(): Palette {
  const next = PALETTES[(PALETTES.indexOf(currentPalette()) + 1) % PALETTES.length] ?? 'original';
  applyPalette(next);
  return next;
}
