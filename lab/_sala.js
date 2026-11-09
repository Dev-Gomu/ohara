// Sala de protótipos. Os CSS do app entram por import (o Vite os serve como estilo, sem copiar).
// Uso em cada experimento (<script type="module">):
//   import { Sala } from './_sala.js';
//   Sala.montar({ titulo, dados, variantes: [{ id, nome, html: (dados) => '<div>…</div>' }] })
// A barra lembra as escolhas; ?tema=escuro&paleta=a&v=b (ou v=todas)&largura=1280&altura=190&fundo=cartao as sobrepõem.
import '../src/ui/styles/fonts.css';
import '../src/ui/styles/tokens.css';
import '../src/ui/styles/paletas.css';
import '../src/ui/styles/base.css';
import './_sala.css';

export const Sala = (() => {
  const CHAVE = 'ohara2-lab';
  const raiz = document.documentElement;
  const url = new URLSearchParams(location.search);
  function lerGuardado() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE) ?? '{}');
    } catch {
      return {};
    }
  }
  const estado = {
    tema: 'claro',
    paleta: 'original',
    largura: '1280',
    altura: '190',
    fundo: 'app',
    v: '',
    ...lerGuardado(),
  };
  for (const [chave, valor] of url) estado[chave] = valor;

  const OPCOES = {
    tema: ['claro', 'escuro'],
    paleta: ['original', 'a', 'b', 'c'],
    largura: [
      ['768', 'Tablet retrato'],
      ['1280', 'Tablet'],
      ['1920', 'PC'],
      ['livre', 'Livre'],
    ],
    altura: [
      ['140', 'Baixa'],
      ['190', 'Média'],
      ['240', 'Alta'],
    ],
    fundo: [
      ['app', 'Fundo do app'],
      ['cartao', 'Fundo de bloco'],
    ],
  };

  function aplicar(palco) {
    raiz.dataset.tema = estado.tema;
    if (estado.paleta === 'original') delete raiz.dataset.paleta;
    else raiz.dataset.paleta = estado.paleta;
    palco.style.maxWidth = estado.largura === 'livre' ? 'none' : `${estado.largura}px`;
    palco.style.setProperty('--lab-w', estado.largura === 'livre' ? '1280' : estado.largura);
    palco.style.setProperty('--lab-altura', `${estado.altura}px`);
    palco.style.setProperty(
      '--lab-fundo',
      estado.fundo === 'cartao' ? 'var(--cor-cartao)' : 'var(--cor-fundo)',
    );
    document.body.style.background = 'var(--cor-fundo)';
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      /* sem armazenamento: a sala funciona igual */
    }
  }

  const selects = {};

  function seletor(chave, rotulo, palco) {
    const label = document.createElement('label');
    label.append(rotulo);
    const select = document.createElement('select');
    for (const opcao of OPCOES[chave]) {
      const [valor, texto] = Array.isArray(opcao) ? opcao : [opcao, opcao];
      select.add(new Option(texto, valor, false, valor === estado[chave]));
    }
    select.onchange = () => {
      estado[chave] = select.value;
      aplicar(palco);
    };
    selects[chave] = select;
    label.append(select);
    return label;
  }

  function ciclar(chave, palco) {
    const select = selects[chave];
    select.selectedIndex = (select.selectedIndex + 1) % select.options.length;
    estado[chave] = select.value;
    aplicar(palco);
  }

  function botao(texto, rotulo, aoClicar) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'sala-botao';
    el.textContent = texto;
    el.ariaLabel = rotulo;
    el.onclick = aoClicar;
    return el;
  }

  function montar({ titulo, dados, variantes }) {
    document.title = `${titulo} · Sala`;
    const barra = document.createElement('header');
    barra.className = 'sala-barra';
    const palco = document.createElement('main');
    palco.className = 'sala-palco';

    const h1 = document.createElement('h1');
    h1.textContent = titulo;
    const voltar = document.createElement('a');
    voltar.href = './';
    voltar.textContent = 'Índice';
    barra.append(h1, voltar);

    const ids = variantes.map((v) => v.id);
    let atual = ids.includes(estado.v) ? estado.v : estado.v === 'todas' ? 'todas' : ids[0];
    const secoes = new Map();
    const abas = new Map();
    for (const variante of variantes) {
      const secao = document.createElement('section');
      secao.className = 'sala-variante';
      secao.dataset.v = variante.id;
      secao.innerHTML = `<h2>${variante.nome}</h2>${variante.html(dados)}`;
      secoes.set(variante.id, secao);
      palco.append(secao);
    }

    function mostrar(id) {
      atual = id;
      estado.v = id;
      for (const [chave, secao] of secoes) secao.hidden = id !== 'todas' && chave !== id;
      for (const [chave, aba] of abas) aba.ariaPressed = String(chave === id);
      aplicar(palco);
    }
    function andar(passo) {
      const posicao = atual === 'todas' ? 0 : ids.indexOf(atual);
      mostrar(ids[(posicao + passo + ids.length) % ids.length]);
    }

    const slides = document.createElement('span');
    slides.className = 'sala-grupo sala-slides';
    slides.append(botao('‹', 'Versão anterior', () => andar(-1)));
    for (const id of ids) {
      const aba = botao(id.toUpperCase(), `Versão ${id.toUpperCase()}`, () => mostrar(id));
      abas.set(id, aba);
      slides.append(aba);
    }
    const todas = botao('Todas', 'Ver todas lado a lado', () => mostrar('todas'));
    abas.set('todas', todas);
    slides.append(botao('›', 'Próxima versão', () => andar(1)), todas);
    barra.append(slides);

    const ambiente = document.createElement('span');
    ambiente.className = 'sala-grupo';
    ambiente.append(
      seletor('tema', 'Tema', palco),
      seletor('paleta', 'Paleta', palco),
      seletor('largura', 'Largura', palco),
      seletor('altura', 'Altura', palco),
      seletor('fundo', 'Fundo', palco),
    );
    barra.append(ambiente);
    const dica = document.createElement('small');
    dica.className = 'sala-dica';
    dica.textContent = '← → versão · D tema · L largura · P paleta · T todas';
    barra.append(dica);

    document.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLSelectElement || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.code === 'ArrowRight') andar(1);
      else if (e.code === 'ArrowLeft') andar(-1);
      else if (e.code === 'KeyT') mostrar('todas');
      else if (e.code === 'KeyD') ciclar('tema', palco);
      else if (e.code === 'KeyL') ciclar('largura', palco);
      else if (e.code === 'KeyP') ciclar('paleta', palco);
      else if (/^Digit[1-9]$/.test(e.code) && ids[Number(e.code.slice(5)) - 1]) {
        mostrar(ids[Number(e.code.slice(5)) - 1]);
      } else return;
      e.preventDefault();
    });

    document.body.append(barra, palco);
    mostrar(atual);
  }

  return { montar };
})();
