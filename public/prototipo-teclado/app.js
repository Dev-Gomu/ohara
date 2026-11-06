import { KEYS, modsOf, neighbor, resolve } from './teclas.js';

const $ = (selector) => document.querySelector(selector);
const STORE = 'ohara2-prototipo-teclado';
const BLOCKS = { S: 'Slides', A: 'Anotações', C: 'Cartões' };
const LEVELS = { m: 'menu', b: 'bloco', f: 'campo' };
const SLIDES = ['Introdução', 'Imunidade inata', 'Fagocitose', 'Células NK'];
const PASSES = {
  livre: { name: 'sem cursor em campo', list: KEYS },
  campo: { name: 'com cursor em campo', list: KEYS.filter((k) => k.levels.includes('f')) },
};

const ui = {
  mode: 'mesa',
  level: 'b',
  focus: 'A',
  visible: ['S', 'A', 'C'],
  maximized: null,
  overlay: null,
  menuIndex: 0,
  page: 1,
  screen: 1,
};

const saved = load();
const test = {
  pass: saved.pass ?? 'livre',
  index: saved.index ?? 0,
  results: saved.results ?? {},
  log: saved.log ?? [],
  pending: saved.pending ?? null,
  lost: false,
};

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) ?? {};
  } catch {
    return {};
  }
}

function persist() {
  const { pass, index, results, log, pending } = test;
  try {
    localStorage.setItem(STORE, JSON.stringify({ pass, index, results, log, pending }));
  } catch {
    toast('Não consegui guardar o progresso neste aparelho.');
  }
}

let toastTimer;
function toast(text) {
  $('#toast').textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($('#toast').textContent = ''), 2600);
}

function describe(e) {
  const mods = [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', e.metaKey && 'Meta'];
  return [...mods.filter(Boolean), e.code || `(sem code: ${e.keyCode})`].join('+');
}

function record(e, outcome) {
  const entry = [
    new Date().toISOString().slice(11, 19),
    describe(e),
    `key=${e.key}`,
    e.getModifierState?.('AltGraph') ? 'altgr' : '',
    e.isComposing || e.keyCode === 229 ? 'ime' : '',
    e.repeat ? 'repete' : '',
    outcome,
  ];
  test.log.push(entry.filter(Boolean).join(' '));
  test.log = test.log.slice(-300);
  $('#lastKey').textContent = `${describe(e)} · ${outcome}`;
}

function noteEvent(text) {
  test.log.push(`${new Date().toISOString().slice(11, 19)} [${text}]`);
  test.log = test.log.slice(-300);
  persist();
}

/* ---------- Mesa ---------- */

function arrange() {
  const shown = ui.maximized ? [ui.maximized] : ui.visible;
  const mesa = $('#mesa');
  for (const id of Object.keys(BLOCKS)) {
    const element = blockElement(id);
    const position = shown.indexOf(id);
    element.hidden = position < 0;
    element.style.gridArea = 'abc'[position] ?? '';
    element.classList.toggle('foco', id === ui.focus && ui.level !== 'm');
    element.classList.toggle('editando', id === ui.focus && ui.level === 'f');
  }
  const areas = { 1: '"a"', 2: '"a b"', 3: '"a b" "a c"' };
  mesa.style.gridTemplateAreas = areas[shown.length] ?? '';
  mesa.style.gridTemplateColumns = shown.length > 1 ? '1fr 1fr' : '1fr';
  mesa.style.gridTemplateRows = shown.length === 3 ? '1fr 1fr' : '1fr';
  $('#slide').innerHTML = `<b>${SLIDES[ui.page]}</b><span>Página ${ui.page + 1} de ${SLIDES.length}</span>`;
}

const blockElement = (id) => $(`[data-block=${id}]`);
const fieldOf = (id) => blockElement(id).querySelector('.campo');
const menuButtons = () => [...document.querySelectorAll('#screens button, #toggles button')];

function renderChrome() {
  $('#screens').innerHTML = Array.from(
    { length: 6 },
    (_, i) => `<button data-screen="${i}" class="${i === ui.screen ? 'ativo' : ''}">${i + 1}</button>`,
  ).join('');
  $('#toggles').innerHTML = Object.entries(BLOCKS)
    .map(
      ([id, name]) =>
        `<button data-toggle="${id}" class="${ui.visible.includes(id) ? 'ativo' : ''}">${name}</button>`,
    )
    .join('');
  menuButtons().forEach((button, i) => {
    button.classList.toggle('alvo', ui.level === 'm' && i === ui.menuIndex);
  });
  for (const button of document.querySelectorAll('[data-mode]')) {
    button.classList.toggle('ativo', button.dataset.mode === ui.mode);
  }
  $('#level').textContent =
    ui.mode === 'mesa' ? `Nível: ${LEVELS[ui.level]} · ${BLOCKS[ui.focus] ?? ''}` : '';
}

function render() {
  arrange();
  renderChrome();
  $('#mesa').hidden = ui.mode !== 'mesa';
  $('#verificar').hidden = ui.mode !== 'verificar';
  $('#relatorio').hidden = ui.mode !== 'relatorio';
  if (ui.mode === 'verificar') renderCheck();
  if (ui.mode === 'relatorio') renderReport();
}

function setLevel(level) {
  ui.level = level;
  if (level === 'f') fieldOf(ui.focus).focus();
  else document.activeElement?.blur?.();
  render();
}

function setFocus(id) {
  ui.focus = id;
  if (ui.level === 'f') fieldOf(id).focus();
  render();
}

function rectsOfBlocks() {
  const rects = {};
  for (const id of ui.visible) {
    const r = blockElement(id).getBoundingClientRect();
    rects[id] = { x: r.x, y: r.y, w: r.width, h: r.height };
  }
  return rects;
}

function moveFocus(direction) {
  if (ui.level === 'm') {
    if (direction === 'down') return setLevel('b');
    const step = direction === 'right' ? 1 : direction === 'left' ? -1 : 0;
    const total = menuButtons().length;
    ui.menuIndex = (ui.menuIndex + step + total) % total;
    return render();
  }
  const target = neighbor(rectsOfBlocks(), ui.focus, direction);
  if (target) setFocus(target);
}

function cycleBlock(step) {
  const i = ui.visible.indexOf(ui.focus);
  const total = ui.visible.length;
  if (total) setFocus(ui.visible[(i + step + total) % total]);
}

function swapBlock(direction) {
  const target = neighbor(rectsOfBlocks(), ui.focus, direction);
  if (!target) return;
  const a = ui.visible.indexOf(ui.focus);
  const b = ui.visible.indexOf(target);
  [ui.visible[a], ui.visible[b]] = [ui.visible[b], ui.visible[a]];
  render();
}

function toggleBlock(id) {
  ui.maximized = null;
  if (ui.visible.includes(id)) {
    if (ui.visible.length === 1) return toast('Pelo menos um bloco fica aberto.');
    ui.visible = ui.visible.filter((block) => block !== id);
    if (ui.focus === id) ui.focus = ui.visible[0];
  } else {
    ui.visible.push(id);
    ui.focus = id;
  }
  render();
}

function openOverlay(kind) {
  ui.overlay = kind;
  const box = $('#overlay');
  box.hidden = false;
  if (kind === 'help') box.innerHTML = helpHtml();
  if (kind === 'palette') box.innerHTML = '<h2>Ir para…</h2><input aria-label="Ir para" />';
  if (kind === 'reminder') box.innerHTML = '<h2>Lembrete</h2><input aria-label="Lembrete" />';
  if (kind === 'options') box.innerHTML = `<h2>Opções de ${BLOCKS[ui.focus]}</h2><p>Menu ⋮ de mentira.</p>`;
  box.querySelector('input')?.focus();
}

function closeOverlay() {
  ui.overlay = null;
  $('#overlay').hidden = true;
  if (ui.level === 'f') fieldOf(ui.focus).focus();
  else document.activeElement?.blur?.();
}

function helpHtml() {
  const groups = Object.groupBy(KEYS, (k) => k.group);
  const sections = Object.entries(groups).map(([group, keys]) => {
    const rows = keys.map((k) => `<dt>${k.label}</dt><dd>${k.text}</dd>`).join('');
    return `<h3>${group}</h3><dl>${rows}</dl>`;
  });
  return `<h2>Atalhos em teste</h2>${sections.join('')}`;
}

const actions = {
  screen: (k) => {
    ui.screen = k.arg;
    toast(`Tela: ${k.text}`);
    render();
  },
  move: (k) => moveFocus(k.arg),
  swap: (k) => swapBlock(k.arg),
  nextBlock: () => cycleBlock(1),
  previousBlock: () => cycleBlock(-1),
  toggle: (k) => toggleBlock(k.arg),
  maximize: () => {
    ui.maximized = ui.maximized ? null : ui.focus;
    render();
  },
  close: () => toggleBlock(ui.focus),
  options: () => openOverlay('options'),
  palette: () => openOverlay('palette'),
  reminder: () => openOverlay('reminder'),
  help: () => openOverlay('help'),
  note: (k) => toast(k.text),
  page: (k) => {
    ui.page = Math.min(SLIDES.length - 1, Math.max(0, ui.page + k.arg));
    render();
  },
  enter: () => {
    if (ui.level === 'm') return menuButtons()[ui.menuIndex]?.click();
    setLevel('f');
  },
  escape: () => {
    if (ui.level === 'f') setLevel('b');
    else if (ui.level === 'b') setLevel('m');
  },
};

function handleMesaKey(e) {
  if (e.code === 'Escape' && ui.overlay) {
    e.preventDefault();
    record(e, 'fecha janela');
    return closeOverlay();
  }
  if (ui.overlay) return record(e, 'janela aberta');
  const match = resolve(e, { level: ui.level });
  if (!match) return record(e, `sem ação no nível ${LEVELS[ui.level]}`);
  e.preventDefault();
  record(e, match.text);
  actions[match.action](match);
}

/* ---------- Verificador ---------- */

const currentList = () => PASSES[test.pass].list;
const currentKey = () => currentList()[test.index];
const resultId = (k) => `${test.pass}|${k.id}`;

function renderCheck() {
  const list = currentList();
  const k = currentKey();
  const field = $('#vField');
  field.hidden = test.pass !== 'campo' || !k;
  $('#vPass').textContent =
    test.pass === 'livre' ? 'Ir para o teste com cursor em campo' : 'Voltar ao teste sem campo';
  if (!k) {
    $('#vProgress').textContent = `Teste ${PASSES[test.pass].name}: concluído.`;
    $('#vPrompt').textContent = 'Fim desta lista';
    $('#vFeedback').textContent = 'Passe para a outra lista ou abra o Relatório.';
    return;
  }
  $('#vProgress').textContent =
    `${test.index + 1} de ${list.length} · ${k.group} · ${PASSES[test.pass].name}`;
  $('#vPrompt').textContent = k.label;
  if (test.pass === 'campo') field.focus();
}

function saveResult(k, status, detail = '') {
  test.results[resultId(k)] = { label: k.label, status, detail };
  test.index += 1;
  test.pending = null;
  $('#vFeedback').textContent = '';
  persist();
  render();
}

// Espera um instante depois da tecla: se o sistema a roubou, a janela perde o foco nesse intervalo.
function confirmKey(k, detail) {
  test.pending = resultId(k);
  test.lost = false;
  persist();
  const index = test.index;
  setTimeout(() => {
    if (test.index !== index || ui.mode !== 'verificar') return;
    saveResult(k, test.lost ? 'chegou, mas o sistema também agiu' : 'ok', detail);
  }, 350);
}

function handleCheckKey(e) {
  e.preventDefault();
  e.stopPropagation();
  if (['Alt', 'Control', 'Shift', 'Meta', 'AltGraph'].includes(e.key)) return;
  const k = currentKey();
  if (!k || e.repeat || test.pending) return;
  const sameMods = modsOf(e) === k.mods;
  const sameCode = e.code === k.code;
  const printed = k.label.split(' ').at(-1);
  if (sameMods && sameCode) {
    record(e, `esperada ${k.label}`);
    return confirmKey(k, `key=${e.key}`);
  }
  if (sameMods && e.key === printed) {
    record(e, `esperada ${k.label}, code diferente`);
    return confirmKey(k, `code real ${e.code}`);
  }
  record(e, `outra tecla (esperada ${k.label})`);
  $('#vFeedback').textContent = `Chegou ${describe(e)} (key: ${e.key}). Tente de novo ou toque em "Não aconteceu nada".`;
}

function resumeInterrupted() {
  if (!test.pending) return;
  const k = currentKey();
  if (k) {
    test.results[test.pending] = {
      label: k.label,
      status: 'derrubou a página',
      detail: 'a página recarregou',
    };
    test.index += 1;
  }
  test.pending = null;
  persist();
}

window.addEventListener('blur', () => {
  test.lost = true;
  noteEvent('janela perdeu o foco');
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) test.lost = true;
  noteEvent(document.hidden ? 'app escondido' : 'app visível');
});
window.addEventListener('popstate', () => {
  test.lost = true;
  noteEvent('voltar do navegador');
  history.pushState(null, '');
});

/* ---------- Relatório ---------- */

async function layoutSample() {
  try {
    const map = await navigator.keyboard?.getLayoutMap();
    if (!map) return 'indisponível';
    const codes = ['Slash', 'IntlRo', 'BracketLeft', 'BracketRight', 'Backslash', 'Semicolon', 'Quote'];
    return codes.map((code) => `${code}=${map.get(code) ?? '-'}`).join(' ');
  } catch {
    return 'indisponível';
  }
}

let layoutText = 'indisponível';

function reportText() {
  const standalone = matchMedia('(display-mode: standalone)').matches;
  const lines = [
    'RELATÓRIO DE TECLADO OHARA',
    `Data: ${new Date().toISOString()}`,
    `Navegador: ${navigator.userAgent}`,
    `Instalado como app: ${standalone ? 'sim' : 'não'}`,
    `Tela: ${screen.width}x${screen.height}`,
    `Mapa do teclado: ${layoutText}`,
    '',
  ];
  for (const [pass, { name, list }] of Object.entries(PASSES)) {
    const done = list.filter((k) => test.results[`${pass}|${k.id}`]);
    lines.push(`== ${name}: ${done.length} de ${list.length} ==`);
    for (const k of list) {
      const r = test.results[`${pass}|${k.id}`];
      if (r && r.status !== 'ok') lines.push(`${k.label}: ${r.status} ${r.detail}`.trim());
    }
    const ok = done.filter((k) => test.results[`${pass}|${k.id}`].status === 'ok');
    lines.push(`OK: ${ok.map((k) => k.label).join(', ') || 'nenhuma'}`, '');
  }
  lines.push('== Log ==', ...test.log);
  return lines.join('\n');
}

function renderReport() {
  const values = Object.values(test.results);
  const failed = values.filter((r) => r.status !== 'ok').length;
  $('#rSummary').textContent = `${values.length} teclas testadas, ${failed} com problema.`;
  $('#rText').value = reportText();
}

async function copyReport() {
  try {
    await navigator.clipboard.writeText($('#rText').value);
    toast('Relatório copiado.');
  } catch {
    $('#rText').select();
    toast('Selecionei o texto: use Ctrl C.');
  }
}

function saveReport() {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([$('#rText').value], { type: 'text/plain' }));
  link.download = 'relatorio-teclado.txt';
  link.click();
  URL.revokeObjectURL(link.href);
}

function resetTest() {
  Object.assign(test, { pass: 'livre', index: 0, results: {}, log: [], pending: null });
  persist();
  render();
}

/* ---------- Entrada ---------- */

// Único listener de teclado do protótipo, igual à regra D15.
document.addEventListener(
  'keydown',
  (e) => {
    if (ui.mode === 'verificar') handleCheckKey(e);
    else if (ui.mode === 'mesa') handleMesaKey(e);
    persist();
  },
  true,
);

document.addEventListener('click', (e) => {
  const button = e.target.closest('button');
  if (button?.dataset.mode) {
    ui.mode = button.dataset.mode;
    document.activeElement?.blur?.();
    return render();
  }
  if (button?.dataset.screen) return actions.screen({ arg: Number(button.dataset.screen), text: `${Number(button.dataset.screen) + 1}` });
  if (button?.dataset.toggle) return toggleBlock(button.dataset.toggle);
  const block = e.target.closest('[data-block]');
  if (block) {
    ui.focus = block.dataset.block;
    setLevel(e.target.closest('.campo') ? 'f' : 'b');
  }
});

$('#vMissing').addEventListener('click', () => {
  const k = currentKey();
  if (k) saveResult(k, 'não chegou');
});
$('#vSkip').addEventListener('click', () => {
  if (currentKey()) test.index += 1;
  persist();
  render();
});
$('#vBack').addEventListener('click', () => {
  test.index = Math.max(0, test.index - 1);
  persist();
  render();
});
$('#vPass').addEventListener('click', () => {
  test.pass = test.pass === 'livre' ? 'campo' : 'livre';
  const list = currentList();
  const next = list.findIndex((k) => !test.results[resultId(k)]);
  test.index = next < 0 ? list.length : next;
  persist();
  render();
});
$('#rCopy').addEventListener('click', copyReport);
$('#rSave').addEventListener('click', saveReport);
$('#rReset').addEventListener('click', resetTest);

resumeInterrupted();
history.pushState(null, '');
layoutSample().then((text) => {
  layoutText = text;
  render();
});
render();
