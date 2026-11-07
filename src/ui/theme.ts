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
