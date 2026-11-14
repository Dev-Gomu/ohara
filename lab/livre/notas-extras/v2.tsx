// V2 · Meta dentro de cada faixa de semestre (logo abaixo dos bimestres); janela em lista com marca em pílula.
import { Disciplina, Regua, Teclas, useNotas, useTeclas } from './_partes';
import { EsquemaJanela } from './_janela';
import { Geral } from './_geral';

export default function V2() {
  const n = useNotas();
  const campo = useTeclas(n);
  return (
    <div className="nx-palco">
      <Regua n={n} campo={campo} />
      {n.aberta === '' ? <Geral n={n} /> : <Disciplina key={n.materia.sigla} n={n} meta="faixa" />}
      <Teclas itens={[['/', 'busca matéria'], ['← →', 'anda na régua'], ['Enter', 'abre'], ['Esc', 'limpa a busca'], ['E', 'esquema (no app: ⋮)']]} />
      {n.janela && <EsquemaJanela n={n} estilo="lista" />}
    </div>
  );
}
