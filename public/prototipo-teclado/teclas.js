// Tabela candidata de atalhos e resolvedor puro. Este arquivo vira a base da Etapa 2 depois do teste.
// mods: a = Alt, c = Ctrl, s = Shift. levels: m = menu, b = bloco, f = campo.
// label é o que está impresso no teclado ABNT2; code é a posição física, que tem nome de teclado americano.

const key = (group, label, code, mods, levels, action, text, extra = {}) => ({
  id: `${mods}:${code}`,
  group,
  label,
  code,
  mods,
  levels,
  action,
  text,
  ...extra,
});

const SCREENS = ['Hub', 'Mesa', 'Acervo', 'Treino', 'Agenda', 'Configs'];
const DIRECTIONS = [
  ['H', 'KeyH', 'left', 'esquerda'],
  ['J', 'KeyJ', 'down', 'baixo'],
  ['K', 'KeyK', 'up', 'cima'],
  ['L', 'KeyL', 'right', 'direita'],
];
const ARROWS = [
  ['←', 'ArrowLeft', 'left', 'esquerda'],
  ['↓', 'ArrowDown', 'down', 'baixo'],
  ['↑', 'ArrowUp', 'up', 'cima'],
  ['→', 'ArrowRight', 'right', 'direita'],
];

export const KEYS = [
  ...SCREENS.map((name, i) =>
    key('Telas', `Alt ${i + 1}`, `Digit${i + 1}`, 'a', 'mbf', 'screen', name, { arg: i }),
  ),
  ...[...DIRECTIONS, ...ARROWS].map(([label, code, dir, text]) =>
    key('Foco', `Alt ${label}`, code, 'a', 'mbf', 'move', `Foco para ${text}`, { arg: dir }),
  ),
  ...DIRECTIONS.map(([label, code, dir, text]) =>
    key('Foco', `Alt Shift ${label}`, code, 'as', 'bf', 'swap', `Troca com ${text}`, { arg: dir }),
  ),
  ...[...DIRECTIONS, ...ARROWS].map(([label, code, dir, text]) =>
    key('Soltas', label, code, '', 'b', 'move', `Foco para ${text}`, { arg: dir }),
  ),
  key('Soltas', 'Enter', 'Enter', '', 'mb', 'enter', 'Desce um nível'),
  key('Soltas', 'Esc', 'Escape', '', 'mbf', 'escape', 'Fecha ou sobe um nível'),
  key('Soltas', 'Tab', 'Tab', '', 'mb', 'nextBlock', 'Próximo bloco'),
  key('Soltas', 'Shift Tab', 'Tab', 's', 'mb', 'previousBlock', 'Bloco anterior'),
  key('Blocos', 'Alt S', 'KeyS', 'a', 'mbf', 'toggle', 'Abre ou fecha Slides', { arg: 'S' }),
  key('Blocos', 'Alt A', 'KeyA', 'a', 'mbf', 'toggle', 'Abre ou fecha Anotações', { arg: 'A' }),
  key('Blocos', 'Alt C', 'KeyC', 'a', 'mbf', 'toggle', 'Abre ou fecha Cartões', { arg: 'C' }),
  key('Blocos', 'Alt M', 'KeyM', 'a', 'bf', 'maximize', 'Amplia o bloco'),
  key('Blocos', 'Alt W', 'KeyW', 'a', 'bf', 'close', 'Fecha o bloco'),
  key('Blocos', 'Alt R', 'KeyR', 'a', 'bf', 'note', 'Modo de redimensionar'),
  key('Blocos', 'Alt X', 'KeyX', 'a', 'bf', 'note', 'Troca pelo bloco escondido'),
  key('Blocos', 'Alt O', 'KeyO', 'a', 'bf', 'options', 'Opções do bloco'),
  key('Blocos', 'Alt T', 'KeyT', 'a', 'bf', 'note', 'Barra de cima do bloco'),
  key('Blocos', 'Alt F', 'KeyF', 'a', 'bf', 'note', 'Campo do bloco'),
  key('Blocos', 'Alt B', 'KeyB', 'a', 'bf', 'note', 'Barra de baixo do bloco'),
  key('Blocos', 'Alt N', 'KeyN', 'a', 'bf', 'note', 'Cartão novo'),
  key('Blocos', 'Alt 0', 'Digit0', 'a', 'bf', 'note', 'Tamanhos padrão'),
  key('Blocos', 'Alt Shift 0', 'Digit0', 'as', 'bf', 'note', 'Ordem padrão'),
  key('Blocos', 'Alt ,', 'Comma', 'a', 'bf', 'note', 'Controle anterior'),
  key('Blocos', 'Alt .', 'Period', 'a', 'bf', 'note', 'Próximo controle'),
  key('Sistema', 'Alt P', 'KeyP', 'a', 'mbf', 'palette', 'Paleta: ir para…'),
  key('Sistema', 'Ctrl P', 'KeyP', 'c', 'mbf', 'palette', 'Paleta (alternativa)'),
  key('Sistema', 'Alt I', 'KeyI', 'a', 'mbf', 'reminder', 'Lembrete rápido'),
  key('Sistema', 'Alt /', 'IntlRo', 'a', 'mbf', 'help', 'Ajuda'),
  key('Sistema', 'Alt ;', 'Slash', 'a', 'mbf', 'help', 'Ajuda (alternativa)'),
  key('Sistema', 'F1', 'F1', '', 'mbf', 'help', 'Ajuda (alternativa)'),
  key('Slides', 'Alt [', 'BracketRight', 'a', 'mbf', 'page', 'Página anterior', { arg: -1 }),
  key('Slides', 'Alt ]', 'Backslash', 'a', 'mbf', 'page', 'Próxima página', { arg: 1 }),
  key('Slides', 'Alt Page Up', 'PageUp', 'a', 'mbf', 'page', 'Página anterior', { arg: -1 }),
  key('Slides', 'Alt Page Down', 'PageDown', 'a', 'mbf', 'page', 'Próxima página', { arg: 1 }),
  key('Editor', 'Ctrl B', 'KeyB', 'c', 'f', 'note', 'Negrito'),
  key('Editor', 'Ctrl I', 'KeyI', 'c', 'f', 'note', 'Itálico'),
  key('Editor', 'Ctrl U', 'KeyU', 'c', 'f', 'note', 'Sublinhado'),
  key('Editor', 'Ctrl K', 'KeyK', 'c', 'f', 'note', 'Link'),
  key('Editor', 'Ctrl E', 'KeyE', 'c', 'f', 'note', 'Código ou destaque'),
  key('Editor', 'Ctrl M', 'KeyM', 'c', 'f', 'note', 'Marcar a página do slide'),
  key('Editor', 'Ctrl Enter', 'Enter', 'c', 'f', 'note', 'Salvar cartões'),
  key('Editor', 'Ctrl Shift H', 'KeyH', 'cs', 'f', 'note', 'Marca-texto'),
  key('Editor', 'Ctrl Shift X', 'KeyX', 'cs', 'f', 'note', 'Riscado'),
  ...[1, 2, 3].map((n) =>
    key('Editor', `Ctrl Alt ${n}`, `Digit${n}`, 'ca', 'f', 'note', `Título ${n}`),
  ),
  ...[
    [7, 'Lista numerada'],
    [8, 'Lista com marcadores'],
    [9, 'Lista de tarefas'],
  ].map(([n, text]) => key('Editor', `Ctrl Shift ${n}`, `Digit${n}`, 'cs', 'f', 'note', text)),
];

export function modsOf(e) {
  return `${e.ctrlKey ? 'c' : ''}${e.altKey ? 'a' : ''}${e.shiftKey ? 's' : ''}`;
}

// Resolvedor puro: mesma entrada, mesma saída. ctx.level é 'm', 'b' ou 'f'.
export function resolve(e, ctx) {
  if (e.isComposing || e.metaKey) return null;
  const mods = modsOf(e);
  return KEYS.find((k) => k.code === e.code && k.mods === mods && k.levels.includes(ctx.level)) ?? null;
}

// O bloco vizinho é o mais próximo no lado pedido; estar alinhado pesa mais do que estar perto.
export function neighbor(rects, from, direction) {
  const a = rects[from];
  if (!a) return null;
  const horizontal = direction === 'left' || direction === 'right';
  const sign = direction === 'right' || direction === 'down' ? 1 : -1;
  const center = (r) => [r.x + r.w / 2, r.y + r.h / 2];
  const [ax, ay] = center(a);
  let best = null;
  let bestScore = Infinity;
  for (const [id, b] of Object.entries(rects)) {
    if (id === from) continue;
    const [bx, by] = center(b);
    const main = (horizontal ? bx - ax : by - ay) * sign;
    if (main < 2) continue;
    const score = main + Math.abs(horizontal ? by - ay : bx - ax) * 0.5;
    if (score < bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}
