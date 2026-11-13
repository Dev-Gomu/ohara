// Lista dos 20 botões de formatação. Cada linha: o botão como ficaria, o que faz, um exemplo e onde colocar.
// Escolha por linha: Barra (máx. 6), Menu Aa, ou Fora. A escolha fica guardada neste navegador.
import { useState } from 'react';
import { BOTOES } from './dados';
import './botoes.css';

type Lugar = 'barra' | 'menu' | 'fora';
const CHAVE = 'ohara2-lab-botoes-formatacao';
const PADRAO: Record<string, Lugar> = Object.fromEntries(
  BOTOES.map((b) => [b.id, b.essencial ? 'barra' : 'menu']),
) as Record<string, Lugar>;

function lerEscolhas(): Record<string, Lugar> {
  try {
    return { ...PADRAO, ...(JSON.parse(localStorage.getItem(CHAVE) ?? '{}') as Record<string, Lugar>) };
  } catch {
    return PADRAO;
  }
}

export default function V1() {
  const [lugar, setLugar] = useState(lerEscolhas);
  const muda = (id: string, v: Lugar) => {
    const prox = { ...lugar, [id]: v };
    setLugar(prox);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(prox));
    } catch {
      // só não guarda
    }
  };
  const barra = BOTOES.filter((b) => lugar[b.id] === 'barra');
  const menu = BOTOES.filter((b) => lugar[b.id] === 'menu');
  return (
    <div className="bf-pagina">
      <section className="bf-previa" aria-label="Prévia da barra">
        <div className="bf-faixa" data-excesso={barra.length > 6 || undefined}>
          {barra.map((b) => (
            <span key={b.id} className="bf-b" title={b.nome}>{b.glifo}</span>
          ))}
          {menu.length > 0 && <span className="bf-b bf-aa" title="Menu Aa"><b>Aa</b></span>}
        </div>
        <p className="bf-conta">
          Na barra: <b>{barra.length}</b> de 6{barra.length > 6 ? ' (passou do limite)' : ''} · No menu Aa: <b>{menu.length}</b> · Fora: <b>{BOTOES.length - barra.length - menu.length}</b>
        </p>
      </section>
      <ul className="bf-lista">
        {BOTOES.map((b, i) => (
          <li key={b.id} className="bf-linha">
            <span className="bf-n">{i + 1}</span>
            <span className="bf-b bf-grande" aria-hidden="true">{b.glifo}</span>
            <span className="bf-texto">
              <b>{b.nome}</b>
              <span>{b.funcao}</span>
            </span>
            <span className="bf-exemplo">{b.exemplo}</span>
            <span className="bf-estado" data-pronto={b.pronto}>{b.pronto ? 'já no app' : 'precisa extensão'}</span>
            <span className="bf-escolha" role="radiogroup" aria-label={`Onde fica ${b.nome}`}>
              {(['barra', 'menu', 'fora'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={lugar[b.id] === v}
                  onClick={() => muda(b.id, v)}
                >
                  {v === 'barra' ? 'Barra' : v === 'menu' ? 'Menu Aa' : 'Fora'}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
