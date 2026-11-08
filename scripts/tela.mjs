// Captura de tela barata para conferir visual: claro e escuro lado a lado numa imagem só,
// pequena e em JPEG. Pede o `npm run dev` rodando.
// Uso: npm run tela -- [caminho] [--teclas "Alt+3,Enter"] [--sel "[data-block=x]"]
//      [--temas claro,escuro] [--paleta a] [--largura 1280] [--altura 800] [--escala 0.5]
//      [--saida nome]
// Exemplos: npm run tela -- --teclas "Alt+3,Enter,Enter" --sel "[data-block='acervo.aulas']"
//           npm run tela -- "lab/acervo-1-foco.html?v=e"
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173/ohara/';
const PASTA = '.telas';

function lerArgs(lista) {
  const opcoes = {
    caminho: '?exemplo',
    teclas: '',
    sel: '',
    temas: 'claro,escuro',
    paleta: 'a',
    largura: '1280',
    altura: '800',
    escala: '0.5',
    saida: 'tela',
  };
  for (let i = 0; i < lista.length; i++) {
    const item = lista[i];
    if (item.startsWith('--')) opcoes[item.slice(2)] = lista[++i] ?? '';
    else opcoes.caminho = item;
  }
  return opcoes;
}

function comPaleta(caminho, paleta) {
  if (paleta === '' || caminho.includes('paleta=')) return caminho;
  return `${caminho}${caminho.includes('?') ? '&' : '?'}paleta=${paleta}`;
}

async function capturar(pagina, sel) {
  if (sel === '') return pagina.screenshot();
  try {
    return await pagina.locator(sel).first().screenshot({ timeout: 5000 });
  } catch {
    console.error(`Não achei "${sel}"; capturei a tela inteira.`);
    return pagina.screenshot();
  }
}

async function principal() {
  const opcoes = lerArgs(process.argv.slice(2));
  try {
    await fetch(BASE);
  } catch {
    console.error('Servidor parado: rode "npm run dev" antes.');
    process.exit(1);
  }
  const navegador = await chromium.launch();
  const largura = Number(opcoes.largura);
  const pagina = await navegador.newPage({
    viewport: { width: largura, height: Number(opcoes.altura) },
  });
  await pagina.goto(BASE + comPaleta(opcoes.caminho, opcoes.paleta));
  await pagina.waitForLoadState('networkidle');
  // O app abre o banco antes de desenhar os blocos; as bancadas do lab não têm blocos.
  if (!opcoes.caminho.startsWith('lab/')) {
    await pagina.waitForSelector('[data-block]', { timeout: 15000 });
  }
  for (const tecla of opcoes.teclas.split(',').filter(Boolean)) {
    await pagina.keyboard.press(tecla.trim());
    await pagina.waitForTimeout(150);
  }

  const imagens = [];
  for (const tema of opcoes.temas.split(',').filter(Boolean)) {
    // Troca só o atributo: recarregar perderia o lugar que as teclas abriram.
    await pagina.evaluate((valor) => (document.documentElement.dataset.tema = valor), tema);
    await pagina.waitForTimeout(250);
    imagens.push({ tema, dados: (await capturar(pagina, opcoes.sel)).toString('base64') });
  }

  // Junta as imagens lado a lado e reduz pela escala, numa página montada só para isso.
  const escala = Number(opcoes.escala);
  const folha = await navegador.newPage({ viewport: { width: 400, height: 300 } });
  await folha.setContent(
    `<body style="margin:0;display:flex;gap:6px;background:#888;width:max-content">${imagens
      .map((img) => `<img src="data:image/png;base64,${img.dados}" style="zoom:${escala}">`)
      .join('')}</body>`,
  );
  await folha.waitForLoadState('load');
  mkdirSync(PASTA, { recursive: true });
  const arquivo = `${PASTA}/${opcoes.saida}.jpg`;
  await folha.locator('body').screenshot({ path: arquivo, type: 'jpeg', quality: 70 });
  await navegador.close();
  console.log(`${arquivo} (${imagens.map((img) => img.tema).join(' | ')})`);
}

await principal();
