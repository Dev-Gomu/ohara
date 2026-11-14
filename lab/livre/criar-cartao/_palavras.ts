// Frase em palavras para escolher lacunas. Palavras vizinhas marcadas viram uma lacuna só.
export interface Palavra {
  texto: string;
  /** Pontuação colada depois da palavra (fica fora da lacuna). */
  cauda: string;
  marcada: boolean;
}

const GAP = /\{\{c\d+::(.+?)(?:::.*?)?\}\}/g;

function soltas(trecho: string, marcada: boolean, lista: Palavra[]): void {
  const colado = /^[^\s]+/.exec(trecho)?.[0];
  const anterior = lista.at(-1);
  if (colado && anterior) {
    anterior.cauda += colado;
    trecho = trecho.slice(colado.length);
  }
  for (const w of trecho.split(/\s+/).filter(Boolean)) {
    const m = /^(.*?)([.,;:!?)]*)$/.exec(w);
    lista.push({ texto: m?.[1] || w, cauda: m?.[1] ? (m[2] ?? '') : '', marcada });
  }
}

export function lerPalavras(texto: string): Palavra[] {
  const lista: Palavra[] = [];
  let ultimo = 0;
  for (const g of texto.matchAll(GAP)) {
    soltas(texto.slice(ultimo, g.index), false, lista);
    for (const w of (g[1] ?? '').split(/\s+/).filter(Boolean))
      lista.push({ texto: w, cauda: '', marcada: true });
    ultimo = g.index + g[0].length;
  }
  soltas(texto.slice(ultimo), false, lista);
  return lista;
}

/** Junta as palavras de volta, numerando as lacunas na ordem da frase. */
export function escrever(lista: Palavra[]): string {
  let n = 0;
  const partes: string[] = [];
  for (let i = 0; i < lista.length; i++) {
    const p = lista[i];
    if (!p) continue;
    if (!p.marcada) {
      partes.push(p.texto + p.cauda);
      continue;
    }
    let fim = i;
    while (lista[fim + 1]?.marcada) fim++;
    const grupo = lista.slice(i, fim + 1);
    const dentro = grupo
      .map((w, j) => (j < grupo.length - 1 ? w.texto + w.cauda : w.texto))
      .join(' ');
    partes.push(`{{c${++n}::${dentro}}}${grupo.at(-1)?.cauda ?? ''}`);
    i = fim;
  }
  return partes.join(' ');
}

/** Índice da palavra onde está o cursor do campo. */
export function palavraNoCursor(texto: string, caret: number): number {
  const antes = texto.slice(0, caret).replace(GAP, '$1');
  return Math.max(0, antes.split(/\s+/).filter(Boolean).length - (/\s$/.test(antes) ? 0 : 1));
}
