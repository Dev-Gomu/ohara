// Janela "Esquema de <sigla>" (D114): modelos prontos 5 + 5 e 3 + 7 e "Mais opções" para pesos livres.
import { useState } from 'react';
import { Field } from '../../../src/ui/components/Controls';
import {
  Button,
  Soft,
  Window,
  WindowFooter,
  fecharJanela,
  modeloDe,
  JANELA,
  type Notas,
} from './_partes';

type Estilo = 'cartoes' | 'lista';

const MODELOS = [
  { id: '5+5', nome: '5 + 5', apoio: 'os dois bimestres valem igual', v: [5, 5, 5, 5] },
  { id: '3+7', nome: '3 + 7', apoio: 'o 2º bimestre vale mais', v: [3, 7, 3, 7] },
] as const;

export function useJanela(n: Notas) {
  const [escolha, setEscolha] = useState(() => (n.mais ? 'outro' : modeloDe(n.materia.vale)));
  const [v1, setV1] = useState(String(n.materia.vale[0]));
  const [v3, setV3] = useState(String(n.materia.vale[2]));
  const [peso, setPeso] = useState('50');
  const [teto, setTeto] = useState('10');
  const [bonus, setBonus] = useState('0 0 0 0');
  const salvar = () => {
    const a = Number(v1.replace(',', '.'));
    const b = Number(v3.replace(',', '.'));
    const m = MODELOS.find((x) => x.id === escolha);
    if (m) n.salvarVale(m.v);
    else if (a > 0 && a < 10 && b > 0 && b < 10) n.salvarVale([a, 10 - a, b, 10 - b]);
    fecharJanela(n);
  };
  const ativar = (i: number) => {
    if (i < 2) {
      setEscolha(MODELOS[i]!.id);
      n.setMais(false);
    } else if (i === 2) {
      setEscolha('outro');
      n.setMais(true);
    } else if (i === 3) fecharJanela(n);
    else salvar();
  };
  return {
    escolha,
    ativar,
    salvar,
    campos: { v1, setV1, v3, setV3, peso, setPeso, teto, setTeto, bonus, setBonus },
  };
}
type J = ReturnType<typeof useJanela>;

function Campo({
  rotulo,
  apoio,
  valor,
  mudar,
}: {
  rotulo: string;
  apoio?: string;
  valor: string;
  mudar: (s: string) => void;
}) {
  return (
    <label className="nx-campo">
      <span>{rotulo}</span>
      <Field
        label={rotulo}
        inputMode="decimal"
        value={valor}
        onChange={(e) => mudar(e.target.value)}
      />
      {apoio && <Soft>{apoio}</Soft>}
    </label>
  );
}

function MaisOpcoes({ j }: { j: J }) {
  const c = j.campos;
  const resto = (s: string) => {
    const x = Number(s.replace(',', '.'));
    return x > 0 && x < 10 ? `o outro vale ${(10 - x).toFixed(1)}` : 'de 0 a 10, sem os extremos';
  };
  return (
    <div className="nx-mais">
      <Campo rotulo="1º bimestre vale" apoio={resto(c.v1)} valor={c.v1} mudar={c.setV1} />
      <Campo rotulo="3º bimestre vale" apoio={resto(c.v3)} valor={c.v3} mudar={c.setV3} />
      <Campo
        rotulo="Peso do 1º semestre no ano (%)"
        apoio={`2º semestre: ${100 - Number(c.peso || 0)}%`}
        valor={c.peso}
        mudar={c.setPeso}
      />
      <Campo rotulo="Teto da nota com bônus" valor={c.teto} mudar={c.setTeto} />
      <Campo
        rotulo="Bônus por bimestre"
        apoio="quatro números, um por bimestre"
        valor={c.bonus}
        mudar={c.setBonus}
      />
    </div>
  );
}

export function EsquemaJanela({ n, estilo }: { n: Notas; estilo: Estilo }) {
  const j = useJanela(n);
  n.ativar.current = j.ativar;
  const op = (i: number, nome: string, apoio: string, escolhida: boolean) => (
    <button
      key={nome}
      type="button"
      tabIndex={-1}
      className={estilo === 'cartoes' ? 'nx-modelo' : 'nx-linha'}
      aria-pressed={escolhida}
      data-escolhida={escolhida ? '' : undefined}
      data-cursor={n.jc === i ? '' : undefined}
      onClick={() => j.ativar(i)}
    >
      {estilo === 'lista' && <span className="nx-marca" aria-hidden="true" />}
      <b>{nome}</b>
      <Soft>{apoio}</Soft>
    </button>
  );
  return (
    <Window id={JANELA} title={`Esquema de ${n.materia.sigla}`} context="Notas" wide>
      <div className="nx-janela">
        <p className="nx-pergunta">Quanto vale cada bimestre no semestre?</p>
        <div className={estilo === 'cartoes' ? 'nx-modelos' : 'nx-linhas'}>
          {MODELOS.map((m, i) => op(i, m.nome, m.apoio, j.escolha === m.id))}
          {op(
            2,
            'Mais opções',
            estilo === 'cartoes'
              ? 'pesos livres, teto e bônus'
              : 'pesos livres, peso dos semestres, teto e bônus',
            j.escolha === 'outro',
          )}
        </div>
        {n.mais && <MaisOpcoes j={j} />}
        <Soft>Vale para {n.materia.sigla} neste ano. As notas lançadas não mudam; só a conta.</Soft>
      </div>
      <WindowFooter>
        <Button cursor={n.jc === 3} onPress={() => fecharJanela(n)}>
          Cancelar
        </Button>
        <Button variant="primary" cursor={n.jc === 4} onPress={j.salvar}>
          Salvar
        </Button>
      </WindowFooter>
    </Window>
  );
}
