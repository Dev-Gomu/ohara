// Cursor numa tabela das Anotações. Fora do React: o listener precisa saber na hora da tecla.
let inTable = false;

export const isInTable = (): boolean => inTable;

export function setInTable(on: boolean): void {
  inTable = on;
}
