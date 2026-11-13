// Conjunto próprio (Fable, 13/11, D147): todos os ícones da barra, do menu Aa e o caderno, desenhados juntos na grade 24.
// Regras do conjunto: tinta sempre entre 4 e 20 (margem de 4); letras com 12 de largura e 16 de altura;
// figuras "cheias" (listas, tabela) com 16 de largura e 14 de altura, para pesarem igual às letras;
// um só traço, pontas redondas; algarismos pequenos com 80% do traço para não empastarem.
import type { ReactNode } from 'react';

const LINHAS = 'M10 6.5h9M10 12h9M10 17.5h9';
const DOIS_ALTO = 'M16.2 6.3a1.8 1.8 0 0 1 3.4.8c0 1.4-3.4 2-3.4 3.9h3.6';
const DOIS_BAIXO = 'M16.2 14.3a1.8 1.8 0 0 1 3.4.8c0 1.4-3.4 2-3.4 3.9h3.6';

export function fable(traco: number): Record<string, ReactNode> {
  const fino = traco * 0.8;
  return {
    titulo: <path d="M7 5v14M17 5v14M7 12h10" />,
    negrito: <path d="M7.5 5h6a3.5 3.5 0 0 1 0 7h-6zM7.5 12h7a3.5 3.5 0 0 1 0 7h-7z" />,
    italico: <path d="M11 5h6M7 19h6M14 5l-4 14" />,
    marca: <path d="M14 5l4 4-6 6H8v-4zM5 19h14" />,
    topicos: (
      <>
        <path d={LINHAS} />
        <g fill="currentColor" stroke="none">
          <circle cx="5.25" cy="6.5" r="1.25" />
          <circle cx="5.25" cy="12" r="1.25" />
          <circle cx="5.25" cy="17.5" r="1.25" />
        </g>
      </>
    ),
    numerada: (
      <>
        <path d={LINHAS} />
        <path strokeWidth={fino} d="M3.9 5.5l1.5-1v4.5M3.5 16.2a1.4 1.4 0 0 1 2.6.6c0 1.1-2.6 1.5-2.6 3h2.8" />
      </>
    ),
    tabela: (
      <>
        <rect x="5" y="6" width="14" height="12" rx="2.5" />
        <path d="M5 12h14M12 6v12" />
      </>
    ),
    sobre: (
      <>
        <path d="M5 9l8 10M13 9L5 19" />
        <path strokeWidth={fino} d={DOIS_ALTO} />
      </>
    ),
    sub: (
      <>
        <path d="M5 5l8 10M13 5L5 15" />
        <path strokeWidth={fino} d={DOIS_BAIXO} />
      </>
    ),
    desfazer: <path d="M9 13L5 9l4-4M5 9h9a5 5 0 0 1 0 10h-3" />,
    refazer: <path d="M15 13l4-4-4-4M19 9h-9a5 5 0 0 0 0 10h3" />,
    aa: (
      <>
        <path d="M4 19V9.75a3.75 3.75 0 0 1 7.5 0V19M4 14.5h7.5M19.75 13.5V19" />
        <circle cx="17.25" cy="16.5" r="2.5" />
      </>
    ),
    expandir: <path d="M14 5h5v5M10 19H5v-5M19 5l-6 6M5 19l6-6" />,
    mais: (
      <g fill="currentColor" stroke="none">
        <circle cx="12" cy="5.5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="18.5" r="1.5" />
      </g>
    ),
    sublinhado: <path d="M7 5v5.5a5 5 0 0 0 10 0V5M6 19h12" />,
    tachado: <path d="M16 8.5A3.5 3.5 0 0 0 12.5 5h-1a3.5 3.5 0 0 0 0 7h1a3.5 3.5 0 0 1 0 7h-1A3.5 3.5 0 0 1 8 15.5M5 12h14" />,
    link: <path d="M10 8.5H8.5a3.5 3.5 0 0 0 0 7H10M14 8.5h1.5a3.5 3.5 0 0 1 0 7H14M9.5 12h5" />,
    tarefas: (
      <>
        <path d={LINHAS} />
        <g strokeWidth={fino}>
          <rect x="3.6" y="4.8" width="3.4" height="3.4" rx="1" fill="currentColor" />
          <rect x="3.6" y="10.3" width="3.4" height="3.4" rx="1" />
          <rect x="3.6" y="15.8" width="3.4" height="3.4" rx="1" />
        </g>
      </>
    ),
    recuo1: <path d="M11 6.5h8M11 12h8M11 17.5h8M4.5 8.5L8 12l-3.5 3.5" />,
    recuo2: <path d="M11 6.5h8M11 12h8M11 17.5h8M8 8.5L4.5 12 8 15.5" />,
    citacao: <path d="M5 17v-4.5C5 9.5 6.5 7.5 9.5 7M5 12.5h4.5V17H5zM14.5 17v-4.5c0-3 1.5-5 4.5-5.5M14.5 12.5H19V17h-4.5z" />,
    codigo: <path d="M9.5 7.5L5 12l4.5 4.5M14.5 7.5L19 12l-4.5 4.5" />,
    linha: (
      <>
        <path d="M5 12h14" />
        <path strokeWidth={fino} d="M8 6.5h8M8 17.5h8" />
      </>
    ),
    limpar: <path d="M6 7V5h10v2M11 5v14M9 19h4M15 15l4 4M19 15l-4 4" />,
    caderno: (
      <>
        <rect x="7" y="5" width="12" height="14" rx="2.5" />
        <path d="M5 9.5h3.5M5 14.5h3.5" />
        <path strokeWidth={fino} d="M12 10h4M12 14h2.5" />
      </>
    ),
  };
}
