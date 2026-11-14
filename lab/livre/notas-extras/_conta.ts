// Conta da meta (bancada). Pura e sem imports: vira src/core/grades/goal.ts com testes.
// Tudo em pontos do semestre (D113): semestre = pontos do 1º bim. + pontos do 2º bim. (+ bônus).
export type Av = { nome: string; nota: number | null; max: number };

export type Falta =
  | { tipo: 'sem-dados' } // o 1º bimestre do semestre ainda não tem nota
  | { tipo: 'fechado'; total: number } // o bimestre que decide já está todo lançado
  | { tipo: 'garantido' } // a meta já foi batida, mesmo tirando zero
  | { tipo: 'impossivel' } // nem a nota máxima chega
  | { tipo: 'precisa'; pontos: number; nota: number; restante: Restante | null };

// O que falta nas avaliações ainda pendentes do bimestre (só quando parte dele já foi lançada).
export type Restante = { quantas: number; valem: number; tirar: number };

// Arredonda PARA CIMA em 0,1: mostrar 4,6 quando precisa de 4,63 faria o aluno ficar abaixo.
export const cima = (x: number): number => Math.ceil(x * 10 - 1e-9) / 10;

// Pontos do bimestre: (tirado ÷ valia) × valor do bimestre. Pendentes ficam fora.
export function pontos(av: readonly Av[], vale: number): number | null {
  const feitas = av.filter((a) => a.nota !== null);
  const max = feitas.reduce((s, a) => s + a.max, 0);
  if (feitas.length === 0 || max <= 0) return null;
  return (feitas.reduce((s, a) => s + (a.nota ?? 0), 0) / max) * vale;
}

const completo = (av: readonly Av[]) => av.length > 0 && av.every((a) => a.nota !== null);

/** Quanto falta no bimestre `segundo` para chegar a `alvo` pontos, já tendo `antes` pontos. */
export function falta(
  alvo: number,
  antes: number | null,
  segundo: readonly Av[],
  vale: number,
  teto = 10,
): Falta {
  if (antes === null) return { tipo: 'sem-dados' };
  if (completo(segundo)) return { tipo: 'fechado', total: antes + (pontos(segundo, vale) ?? 0) };
  const p = alvo - antes;
  if (p <= 1e-9) return { tipo: 'garantido' };
  if (p > (vale * teto) / 10 + 1e-9) return { tipo: 'impossivel' };
  const feitas = segundo.filter((a) => a.nota !== null);
  const pendentes = segundo.filter((a) => a.nota === null);
  let restante: Restante | null = null;
  if (feitas.length > 0 && pendentes.length > 0) {
    // Vale quando o peso de cada avaliação é a própria nota máxima (padrão da D113).
    const maxTodas = segundo.reduce((s, a) => s + a.max, 0);
    const tirado = feitas.reduce((s, a) => s + (a.nota ?? 0), 0);
    const valem = pendentes.reduce((s, a) => s + a.max, 0);
    const tirar = (p * maxTodas) / vale - tirado;
    if (tirar > valem + 1e-9) return { tipo: 'impossivel' };
    if (tirar <= 1e-9) return { tipo: 'garantido' };
    restante = { quantas: pendentes.length, valem, tirar: cima(tirar) };
  }
  return { tipo: 'precisa', pontos: cima(p), nota: cima((p * 10) / vale), restante };
}

export type Materia = {
  sigla: string;
  cor: number;
  nome: string;
  vale: readonly [number, number, number, number];
  bim: readonly [readonly Av[], readonly Av[], readonly Av[], readonly Av[]];
};

/** Meta do 1º semestre: quanto falta no 2º bim. */
export const falta2 = (m: Materia, meta: number) =>
  falta(meta, pontos(m.bim[0], m.vale[0]), m.bim[1], m.vale[1]);

/** Meta do ano (pesos dos semestres 50/50): quanto falta no 4º bim., dados o 1º semestre e o 3º bim. */
export function falta4(m: Materia, meta: number, peso1 = 50): Falta {
  const s1 = semestre(m, 1);
  if (s1 === null || !completo(m.bim[1])) return { tipo: 'sem-dados' };
  const alvo2 = (meta * 100 - peso1 * s1) / (100 - peso1);
  return falta(alvo2, pontos(m.bim[2], m.vale[2]), m.bim[3], m.vale[3]);
}

export function semestre(m: Materia, s: 1 | 2): number | null {
  const a = pontos(m.bim[s * 2 - 2] ?? [], m.vale[s * 2 - 2] ?? 5);
  const b = pontos(m.bim[s * 2 - 1] ?? [], m.vale[s * 2 - 1] ?? 5);
  return a === null && b === null ? null : (a ?? 0) + (b ?? 0);
}

/** Semestre fechado: os dois bimestres têm avaliações e nenhuma pendente. */
export function fechado(m: Materia, s: 1 | 2): number | null {
  const ok = completo(m.bim[s * 2 - 2] ?? []) && completo(m.bim[s * 2 - 1] ?? []);
  return ok ? semestre(m, s) : null;
}

export function media(m: Materia): number | null {
  const a = semestre(m, 1);
  const b = semestre(m, 2);
  return a === null ? null : b === null ? a : (a + b) / 2;
}

export const f1 = (x: number | null): string => (x === null ? '—' : x.toFixed(1));
