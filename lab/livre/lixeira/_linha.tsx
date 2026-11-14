import { SubjectPill } from '../../../src/ui/components/Pill';
import { excluid, AcoesLinha, quando, resta, umTipo, type Item, type Lix } from './_partes';

/** Linha da lista: sigla, título, apoio (tipo, quando, o que volta junto); com cursor, as ações. */
export function Linha({ i, n, l, tipo }: { i: Item; n: number; l: Lix; tipo?: boolean }) {
  const sel = n === l.cursor;
  const fim = resta(i.quando);
  return (
    <li
      className="lx-linha"
      data-sel={sel}
      data-cursor={sel && !l.menu && !l.confirma ? 'true' : undefined}
      onClick={() => { l.setCursor(n); l.setMenu(false); }}
    >
      <span className="lx-sigla">{i.cor >= 0 ? <SubjectPill code={i.materia} color={i.cor} /> : null}</span>
      <span className="lx-texto">
        <b>{i.titulo}</b>
        <span className="lx-apoio">
          {tipo ? `${umTipo(i.tipo)} · ` : ''}{excluid(i.tipo)} {quando(i.quando)}
          {i.traz ? ` · volta com ${i.traz}` : ''}
          {fim ? <span className="lx-fim"> · {fim}</span> : null}
        </span>
      </span>
      {sel ? <AcoesLinha l={l} /> : <span className="lx-quando">{quando(i.quando)}</span>}
    </li>
  );
}
