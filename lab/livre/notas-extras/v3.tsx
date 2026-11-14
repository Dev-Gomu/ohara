// V3 · Igual à V1 na disciplina, mas abre no Boletim geral, onde a coluna "Precisa" segue o semestre.
import { Disciplina, Regua, Teclas, useNotas, useTeclas } from './_partes';
import { EsquemaJanela } from './_janela';
import { Quanto } from './_quanto';
import { Geral } from './_geral';

export default function V3() {
  const n = useNotas('');
  const campo = useTeclas(n);
  return (
    <div className="nx-palco">
      <Regua n={n} campo={campo} />
      {n.aberta === '' ? <Geral n={n} seguindo /> : <Disciplina key={n.materia.sigla} n={n} lado={<Quanto n={n} />} />}
      <Teclas itens={[['/', 'busca matéria'], ['← →', 'anda na régua'], ['Enter', 'abre'], ['Esc', 'limpa a busca'], ['E', 'esquema (no app: ⋮)']]} />
      {n.janela && <EsquemaJanela n={n} estilo="cartoes" />}
    </div>
  );
}
