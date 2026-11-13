// Lab livre (D133): abre lab/livre.html?ideia=<pasta>. Cada pasta em lab/livre/<ideia>/ tem
// v1.tsx, v2.tsx, v3.tsx (máx. 3), cada um com `export default` de um componente React.
// Sem lint, sem tipos obrigatórios, CSS próprio à vontade. Dados de mentira: lab/_dados.ts.
// Query: ?ideia=x&v=1|2|3|todas&tema=escuro&paleta=a&largura=768 (sobrepõem as escolhas).
import { createRoot } from 'react-dom/client';
import { useEffect, useState, type ComponentType } from 'react';
import '../../src/ui/styles/fonts.css';
import '../../src/ui/styles/tokens.css';
import '../../src/ui/styles/paletas.css';
import '../../src/ui/styles/base.css';
import './moldura.css';

type Modulo = { default: ComponentType };
const modulos = import.meta.glob<Modulo>('./*/v[1-4].tsx', { eager: true });
const pedido = new URLSearchParams(location.search);

const ideias = [...new Set(Object.keys(modulos).map((c) => c.split('/')[1] ?? ''))].sort();
const ideia = pedido.get('ideia') ?? ideias[0] ?? '';
const versoes = [1, 2, 3, 4].flatMap((n) => {
  const modulo = modulos[`./${ideia}/v${n}.tsx`];
  return modulo ? [{ n, Comp: modulo.default }] : [];
});

const LARGURAS = ['768', '1280', '1920', 'livre'];
const TEMAS = ['claro', 'escuro'];
const PALETAS = ['original', 'a', 'b'];

function guardado(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem('ohara2-lab-livre') ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function Moldura() {
  const [est, setEst] = useState(() => ({
    tema: 'claro',
    paleta: 'original',
    largura: '1280',
    v: '1',
    ...guardado(),
    ...Object.fromEntries(pedido),
  }));
  const mudar = (chave: string, valor: string) => setEst((e) => ({ ...e, [chave]: valor }));

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.dataset.tema = est.tema;
    if (est.paleta === 'original') delete raiz.dataset.paleta;
    else raiz.dataset.paleta = est.paleta;
    try {
      localStorage.setItem('ohara2-lab-livre', JSON.stringify(est));
    } catch {
      /* sem armazenamento: funciona igual */
    }
  }, [est]);

  useEffect(() => {
    const aoTecla = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.target instanceof HTMLSelectElement) return;
      const cicla = (lista: string[], chave: string) =>
        mudar(chave, lista[(lista.indexOf(est[chave as keyof typeof est]) + 1) % lista.length] ?? '');
      if (e.code === 'KeyD') cicla(TEMAS, 'tema');
      else if (e.code === 'KeyP') cicla(PALETAS, 'paleta');
      else if (e.code === 'KeyL') cicla(LARGURAS, 'largura');
      else if (e.code === 'KeyT') mudar('v', 'todas');
      else if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        const ns = versoes.map((x) => String(x.n));
        const i = ns.indexOf(est.v);
        const passo = e.code === 'ArrowRight' ? 1 : -1;
        mudar('v', ns[(i + passo + ns.length) % ns.length] ?? '1');
      }
      else if (/^Digit[1-4]$/.test(e.code)) mudar('v', e.code.slice(5));
      else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', aoTecla);
    return () => document.removeEventListener('keydown', aoTecla);
  }, [est]);

  const seletor = (chave: 'tema' | 'paleta' | 'largura', lista: string[]) => (
    <label>
      {chave}
      <select value={est[chave]} onChange={(e) => mudar(chave, e.target.value)}>
        {lista.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );

  const mostradas = est.v === 'todas' ? versoes : versoes.filter((x) => String(x.n) === est.v);
  const largura = est.largura === 'livre' ? 'none' : `${est.largura}px`;

  return (
    <>
      <header className="livre-barra">
        <h1>Lab livre · {ideia || 'nenhuma ideia'}</h1>
        {ideias.length > 1 && (
          <label>
            ideia
            <select
              value={ideia}
              onChange={(e) => {
                pedido.set('ideia', e.target.value);
                location.search = pedido.toString();
              }}
            >
              {ideias.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        )}
        <span className="livre-abas">
          {versoes.map(({ n }) => (
            <button key={n} aria-pressed={est.v === String(n)} onClick={() => mudar('v', String(n))}>
              V{n}
            </button>
          ))}
          <button aria-pressed={est.v === 'todas'} onClick={() => mudar('v', 'todas')}>
            Todas
          </button>
        </span>
        {seletor('tema', TEMAS)}
        {seletor('paleta', PALETAS)}
        {seletor('largura', LARGURAS)}
        <small>← → ou 1-3 versão · T todas · D tema · P paleta · L largura</small>
      </header>
      <main className="livre-palco">
        {mostradas.length === 0 && <p>Nenhuma versão em lab/livre/{ideia}/ (v1.tsx a v3.tsx).</p>}
        {mostradas.map(({ n, Comp }) => (
          <section key={n} className="livre-versao" style={{ maxWidth: largura }}>
            <h2>V{n}</h2>
            <Comp />
          </section>
        ))}
      </main>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<Moldura />);
