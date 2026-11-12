// Notas, degrau 3: o que as peças compostas dividem (formatos, célula, trio de versões).
import type { ReactNode } from 'react';
import { formatGrade } from '../../src/core/grades/grades';
import { Ficha } from '../vitrine/moldura';

export { Sinal } from './notas-dados';
export type Nota = number | null;
export type Versao = 'a' | 'b' | 'c';
export const VERSOES = ['a', 'b', 'c'] as const;
export const META = 7;
export const fmt = formatGrade;

export const De = ({ v }: { v: number }) => <small className="nc-de">de {fmt(v)}</small>;

// Célula C do degrau 2 (D122). `v="b"` troca a pílula do total por letra de voz.
export function Cel({
  v = 'c',
  valor,
  tipo,
  max = 10,
}: {
  v?: 'b' | 'c';
  valor: Nota;
  tipo?: 'total' | 'aberto';
  max?: number;
}) {
  const baixa = valor !== null && valor / max < META / 10;
  const estado = valor === null ? 'pendente' : (tipo ?? (baixa ? 'baixa' : 'normal'));
  return (
    <span className="np-cel" data-v={v} data-estado={estado}>
      {estado === 'baixa' && <i className="np-marca" />}
      {fmt(valor)}
    </span>
  );
}

export function Trio({
  nome,
  largura,
  uso,
  children,
}: {
  nome: string;
  largura: 4 | 12;
  uso: Record<Versao, string>;
  children: (v: Versao) => ReactNode;
}) {
  return (
    <>
      {VERSOES.map((v) => (
        <Ficha
          key={v}
          nome={`${nome} ${v.toUpperCase()}`}
          arquivo="Notas"
          largura={largura}
          uso={uso[v]}
        >
          {children(v)}
        </Ficha>
      ))}
    </>
  );
}
