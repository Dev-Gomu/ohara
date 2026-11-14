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

// 'original' é o Gelo suave (tokens.css, D132) e não põe atributo. ?paleta=a|b|original escolhe e fica guardada.
export type Palette = 'original' | 'a' | 'b';

const PALETTES: readonly Palette[] = ['original', 'a', 'b'];
const PALETTE_KEY = prefixed('paleta');

export const PALETTE_NAMES: Readonly<Record<Palette, string>> = {
  original: 'Gelo suave',
  a: 'Gelo',
  b: 'Índigo',
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

// Estilo de cantos (D143): 'arredondado' é o padrão (tokens.css) e não põe atributo.
export type Corners = 'arredondado' | 'contido';

const CORNERS: readonly Corners[] = ['arredondado', 'contido'];
const CORNERS_KEY = prefixed('cantos');

export const CORNER_NAMES: Readonly<Record<Corners, string>> = {
  arredondado: 'Arredondado',
  contido: 'Contido',
};

function asCorners(value: string | null | undefined): Corners | null {
  return CORNERS.find((item) => item === value) ?? null;
}

function storedCorners(): Corners {
  try {
    return asCorners(localStorage.getItem(CORNERS_KEY)) ?? 'arredondado';
  } catch {
    return 'arredondado';
  }
}

export function currentCorners(): Corners {
  return asCorners(document.documentElement.dataset.cantos) ?? 'arredondado';
}

export function applyCorners(corners?: Corners): void {
  const chosen = corners ?? storedCorners();
  if (chosen === 'arredondado') delete document.documentElement.dataset.cantos;
  else document.documentElement.dataset.cantos = chosen;
  if (corners === undefined) return;
  try {
    localStorage.setItem(CORNERS_KEY, chosen);
  } catch {
    // Sem armazenamento, a escolha vale só até recarregar.
  }
}

export function cycleCorners(): Corners {
  const next = currentCorners() === 'contido' ? 'arredondado' : 'contido';
  applyCorners(next);
  return next;
}
