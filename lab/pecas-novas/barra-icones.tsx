// Barra do topo com ícone por tela. ?peca=barraicones  (teclas 1 a 6 trocam a aba atual; T troca o tema)
import { useEffect, useState, type ReactNode } from 'react';
import { Island } from '../../src/ui/components/Island';
import './barra-icones.css';

const NOMES = ['Hub', 'Mesa', 'Acervo', 'Treino', 'Agenda', 'Configs'];

const ICONES: ReactNode[] = [
  <>
    <rect x="4" y="4" width="7" height="7" rx="2" />
    <rect x="13" y="4" width="7" height="7" rx="2" />
    <rect x="4" y="13" width="7" height="7" rx="2" />
    <rect x="13" y="13" width="7" height="7" rx="2" />
  </>,
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M12 4v16M12 12h9" />
  </>,
  <>
    <path d="M4 20V6a2 2 0 0 1 2-2h12v16" />
    <path d="M4 18a2 2 0 0 1 2-2h12M9 8h5" />
  </>,
  <>
    <rect x="7" y="3" width="14" height="14" rx="2" />
    <path d="M3 7v11a3 3 0 0 0 3 3h11" />
  </>,
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </>,
  <>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </>,
];

const Icone = ({ i }: { i: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONES[i]}
  </svg>
);

function Barra({ v, atual, onPick }: { v: 'b' | 'c'; atual: number; onPick: (i: number) => void }) {
  return (
    <nav className="bi-topo">
      <Island label="Telas">
        {NOMES.map((nome, i) => (
          <button
            key={nome}
            type="button"
            tabIndex={-1}
            className="bi-aba"
            data-v={v}
            data-sel={i === atual}
            aria-label={`${i + 1} ${nome}`}
            onClick={() => onPick(i)}
          >
            {v === 'b' ? (
              <>
                <Icone i={i} />
                <span>{i + 1}</span>
              </>
            ) : (
              <>
                <Icone i={i} />
                <small>{i + 1}</small>
              </>
            )}
          </button>
        ))}
      </Island>
      <h1 className="bi-titulo">{NOMES[atual]}</h1>
    </nav>
  );
}

const USO = {
  b: 'B. Ícone e número lado a lado em todas as abas. A barra fica mais larga.',
  c: 'C. Só o ícone, com o número pequeno no canto. Fica quase do tamanho de hoje.',
} as const;

export function BarraIcones() {
  const [atual, setAtual] = useState(Number(new URLSearchParams(location.search).get('atual') ?? 5) - 1);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 6) setAtual(n - 1);
    };
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  }, []);
  return (
    <main className="bi-bancada">
      {(['b', 'c'] as const).map((v) => (
        <section key={v}>
          <p className="bi-legenda">{USO[v]}</p>
          <Barra v={v} atual={atual} onPick={setAtual} />
        </section>
      ))}
    </main>
  );
}
