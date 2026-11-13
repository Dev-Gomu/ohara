// Bancada "aa-icone": o ícone do menu de estilos (Aa), mais alto e mais curvado. Grade 24, traço 1,75 (como a V2 dos ícones).
import type { ReactNode } from 'react';
import './aa.css';

const TRACO = 2;

// Rodada do Fable (13/11): mesmas regras do conjunto (D147): tinta entre 4 e 20, traço 2.
const OPCOES: { id: string; nome: string; nota: string; desenho: ReactNode }[] = [
  {
    id: 'a',
    nome: 'V1 · Dois arcos',
    nota: 'A grande em arco e, ao lado, o mesmo A pequeno, na mesma linha de base',
    desenho: <path d="M4 19V9.75a3.75 3.75 0 0 1 7.5 0V19M4 14.5h7.5M15 19v-4.25a2.25 2.25 0 0 1 4.5 0V19M15 16.5h4.5" />,
  },
  {
    id: 'b',
    nome: 'V2 · Arco e "a" redondo',
    nota: 'A grande em arco e um "a" minúsculo redondo (barriga e haste)',
    desenho: (
      <>
        <path d="M4 19V9.75a3.75 3.75 0 0 1 7.5 0V19M4 14.5h7.5M19.75 13.5V19" />
        <circle cx="17.25" cy="16.5" r="2.5" />
      </>
    ),
  },
  {
    id: 'c',
    nome: 'V3 · Um arco só',
    nota: 'O A em arco sozinho, da rodada anterior, para comparar',
    desenho: <path d="M6 19v-8a6 6 0 0 1 12 0v8M6 14h12" />,
  },
];

function Aa({ desenho, tamanho }: { desenho: ReactNode; tamanho: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={TRACO}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {desenho}
    </svg>
  );
}

export function Pagina({ id }: { id: string }) {
  const o = OPCOES.find((x) => x.id === id)!;
  return (
    <div className="aa-pagina">
      <h3>{o.nome}</h3>
      <p>{o.nota}</p>
      <div className="aa-linha">
        <span className="aa-grande">
          <Aa desenho={o.desenho} tamanho={96} />
        </span>
        <span className="aa-faixa" aria-label="Na barra, em tamanho real">
          <span className="aa-b">
            <Aa
              desenho={
                <>
                  <path d="M7 5v14M17 5v14M7 12h10" />
                </>
              }
              tamanho={20}
            />
          </span>
          <span className="aa-b">
            <Aa desenho={<path d="M9 13L5 9l4-4M5 9h9a5 5 0 0 1 0 10h-3" />} tamanho={20} />
          </span>
          <span className="aa-b aa-ligado">
            <Aa desenho={o.desenho} tamanho={20} />
          </span>
          <span className="aa-b">
            <Aa desenho={<path d="M14 5h5v5M10 19H5v-5M19 5l-6 6M5 19l6-6" />} tamanho={20} />
          </span>
        </span>
        <span className="aa-faixa">
          <span className="aa-b">
            <Aa desenho={o.desenho} tamanho={20} />
          </span>
        </span>
      </div>
    </div>
  );
}
