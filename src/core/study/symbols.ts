// Símbolos ao digitar (D139): tabela própria, do zero. Mais longo primeiro, para "<->" não virar "<" + "->".
export const SYMBOLS: readonly (readonly [string, string])[] = [
  ['<->', '↔'],
  ['->', '→'],
  ['<-', '←'],
  ['=>', '⇒'],
  ['<=', '≤'],
  ['>=', '≥'],
  ['!=', '≠'],
  ['+-', '±'],
];

export function replaceSymbols(text: string): string {
  let result = text;
  for (const [typed, symbol] of SYMBOLS) result = result.split(typed).join(symbol);
  return result;
}

// Ao digitar: se o texto antes do cursor acabou de fechar um símbolo, troca e devolve o novo cursor.
export function symbolAtCaret(
  text: string,
  caret: number,
): { text: string; caret: number } | null {
  const before = text.slice(0, caret);
  for (const [typed, symbol] of SYMBOLS) {
    if (!before.endsWith(typed)) continue;
    const start = caret - typed.length;
    return { text: text.slice(0, start) + symbol + text.slice(caret), caret: start + symbol.length };
  }
  return null;
}
