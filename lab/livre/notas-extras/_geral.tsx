// Boletim geral simplificado da bancada. `seguindo` (V3): a coluna "Precisa" mostra o bimestre que decide agora.
import { Block } from '../../../src/ui/components/Block';
import { SubjectPill } from '../../../src/ui/components/Pill';
import { f1, falta2, falta4, semestre, Soft, type Notas } from './_partes';
import { media, type Falta } from './_conta';

const texto = (f: Falta) =>
  f.tipo === 'precisa' ? <b>{f1(f.nota)}</b> : f.tipo === 'garantido' ? <b className="nx-ok">garantido</b> : f.tipo === 'impossivel' ? <b className="nx-nao">não dá</b> : <Soft>—</Soft>;

export function Geral({ n, seguindo }: { n: Notas; seguindo?: boolean }) {
  return (
    <Block id="nx-geral" title="Boletim geral" count={`meta ${f1(n.meta)} · de 0 a 10`} fixed="none">
      <div className="nx-geral">
        <span className="nx-cab" />
        <span className="nx-cab">1º sem.</span>
        <span className="nx-cab">2º sem.</span>
        <span className="nx-cab">Média</span>
        <span className="nx-cab">{seguindo ? 'Precisa' : 'Precisa no 4º bim.'}</span>
        <span className="nx-cab" />
        {n.vistas.map((m) => {
          const f2 = falta2(m, n.meta);
          const f4 = falta4(m, n.meta);
          const agora = f4.tipo !== 'sem-dados' || !seguindo ? f4 : f2;
          const onde = agora === f2 ? '2º bim.' : '4º bim.';
          return (
            <div key={m.sigla} className="nx-linha-g">
              <SubjectPill code={m.sigla} color={m.cor} />
              <span>{f1(semestre(m, 1))}</span>
              <span>{f1(semestre(m, 2))}</span>
              <b>{f1(media(m))}</b>
              <span className="nx-precisa">
                {texto(agora)}
                {seguindo && ['precisa', 'garantido', 'impossivel'].includes(agora.tipo) && <Soft>{`no ${onde}`}</Soft>}
              </span>
              <span />
            </div>
          );
        })}
      </div>
    </Block>
  );
}
