import type { ReactNode } from 'react';
import type { Screen } from '../../core/keyboard/actions';

const PATHS: Record<Screen, ReactNode> = {
  hub: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </>
  ),
  mesa: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M12 4v16M12 12h9" />
    </>
  ),
  acervo: (
    <>
      <path d="M4 20V6a2 2 0 0 1 2-2h12v16" />
      <path d="M4 18a2 2 0 0 1 2-2h12M9 8h5" />
    </>
  ),
  treino: (
    <>
      <rect x="7" y="3" width="14" height="14" rx="2" />
      <path d="M3 7v11a3 3 0 0 0 3 3h11" />
    </>
  ),
  agenda: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  configs: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
};

// Ícone da tela na aba do topo: traço simples, sem metáfora médica.
export function ScreenIcon({ screen }: { screen: Screen }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[screen]}
    </svg>
  );
}
