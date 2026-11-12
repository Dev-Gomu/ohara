// Trava visual (passo 5 de docs/plano/linguagem-visual.md): CSS das telas e peças
// só usa cor e raio por papel (variáveis de src/ui/styles). Exceção rara: comentário
// `lint-visual-ok: motivo` na mesma linha ou na anterior.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const pasta = join(raiz, 'src', 'ui');
const tokens = join(pasta, 'styles');

const regras = [
  {
    nome: 'cor solta',
    teste: (l) => /#[0-9a-fA-F]{3,8}\b|\b(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|hwb)\(/.test(l),
    dica: 'use uma variável de cor por papel (--cor-*) de src/ui/styles/tokens.css',
  },
  {
    nome: 'raio solto',
    teste: (l) => /border-radius\s*:[^;]*\b([3-9]|[1-9]\d+)(\.\d+)?px/.test(l),
    dica: 'use --raio-bloco, --raio-item, --raio-botao, --raio-campo, --raio-minimo ou --raio-pilula',
  },
  {
    nome: 'tamanho de letra solto',
    teste: (l) => /font-size\s*:\s*[\d.]+(px|rem|em)\b/.test(l),
    dica: 'use a escala de texto dos tokens',
  },
];

function arquivosCss(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    if (caminho === tokens) return [];
    if (statSync(caminho).isDirectory()) return arquivosCss(caminho);
    return caminho.endsWith('.css') ? [caminho] : [];
  });
}

const erros = [];
for (const arquivo of arquivosCss(pasta)) {
  const linhas = readFileSync(arquivo, 'utf8').split('\n');
  linhas.forEach((linha, i) => {
    const codigo = linha.replace(/\/\*.*?\*\//g, '');
    const liberado = /lint-visual-ok/.test(linha) || /lint-visual-ok/.test(linhas[i - 1] ?? '');
    if (liberado) return;
    for (const regra of regras) {
      if (regra.teste(codigo)) {
        erros.push(`${relative(raiz, arquivo)}:${i + 1}  ${regra.nome}: ${linha.trim()}\n    → ${regra.dica}`);
      }
    }
  });
}

if (erros.length > 0) {
  console.error(`Lint visual: ${erros.length} problema(s)\n${erros.join('\n')}`);
  process.exit(1);
}
