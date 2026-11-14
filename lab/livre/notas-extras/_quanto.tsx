// "Quanto preciso tirar" com a meta por semestre: 1º semestre (2º bim.) e ano (4º bim.).
import { Block } from '../../../src/ui/components/Block';
import { NeedLines } from '../../../src/ui/components/Grades';
import { cx, falta2, falta4, f1, linhasFalta, semestre, Soft, type Notas } from './_partes';

export function Quanto({ n }: { n: Notas }) {
  const m = n.materia;
  const l2 = linhasFalta(falta2(m, n.meta), '2º bim.', m.vale[1]);
  const l4 = linhasFalta(falta4(m, n.meta), '4º bim.', m.vale[3]);
  const s1 = semestre(m, 1);
  return (
    <Block id="nx-quanto" title="Quanto preciso tirar" fixed="none">
      <div className={`${cx('nt-pad')} nx-quanto`}>
        <h3 className="nx-grupo">1º semestre</h3>
        {l2.length > 0 ? <NeedLines lines={l2} /> : <NeedLines lines={[['Fechou com', <b key="f">{f1(s1)}</b>]]} />}
        <h3 className="nx-grupo">Ano · média {f1(n.meta)}</h3>
        {falta4(m, n.meta).tipo === 'sem-dados' ? (
          <Soft>aparece quando o 1º semestre fechar</Soft>
        ) : l4.length > 0 ? (
          <NeedLines lines={l4} />
        ) : (
          <Soft>ano fechado</Soft>
        )}
      </div>
    </Block>
  );
}
