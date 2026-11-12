// Gera docs/mapa-gerado.md: títulos # e ## de cada doc e a primeira linha útil de cada arquivo de src/.
// Só lê arquivos e escreve docs/mapa-gerado.md. Uso: node scripts/mapa.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const SAIDA = join(RAIZ, 'docs', 'mapa-gerado.md');
const EXTENSOES = ['.ts', '.tsx', '.css', '.mjs'];

function listar(pasta, filtro) {
  return readdirSync(pasta)
    .map((nome) => join(pasta, nome))
    .filter((caminho) => statSync(caminho).isFile() && filtro(caminho))
    .sort();
}

function listarRecursivo(pasta) {
  return readdirSync(pasta, { withFileTypes: true })
    .flatMap((entrada) => {
      const caminho = join(pasta, entrada.name);
      return entrada.isDirectory() ? listarRecursivo(caminho) : [caminho];
    })
    .filter((caminho) => EXTENSOES.some((ext) => caminho.endsWith(ext)))
    .sort();
}

function titulosDoDoc(caminho) {
  const titulos = [];
  let dentroDeCodigo = false;
  readFileSync(caminho, 'utf8')
    .split('\n')
    .forEach((linha, indice) => {
      if (linha.startsWith('```')) dentroDeCodigo = !dentroDeCodigo;
      if (dentroDeCodigo) return;
      const achado = /^(#|##) (.+)$/.exec(linha);
      if (achado) titulos.push(`- L${indice + 1} ${achado[1]} ${achado[2].trim()}`);
    });
  return titulos;
}

function resumoDoArquivo(caminho) {
  const linhas = readFileSync(caminho, 'utf8').split('\n').slice(0, 40);
  const comentario = linhas.find((linha) => /^\s*(\/\/[^/]|\/\*|\* )/.test(linha) && linha.trim().length > 4);
  if (comentario) return comentario.replace(/^\s*(\/\/|\/\*\*?|\*)\s*/, '').replace(/\*\/\s*$/, '').trim();
  const exportacao = linhas.find((linha) => /^export\s/.test(linha));
  if (exportacao) return `\`${exportacao.trim().replace(/\s*\{?\s*$/, '')}\``;
  return '(sem comentário nem export no topo)';
}

const docs = [
  ...listar(join(RAIZ, 'docs'), (c) => c.endsWith('.md') && !c.endsWith('mapa-gerado.md')),
  ...listar(join(RAIZ, 'docs', 'plano'), (c) => c.endsWith('.md')),
];

const partes = [
  '<!-- Gerado por `node scripts/mapa.mjs`. Não editar à mão. -->',
  '# Mapa gerado do projeto',
  '',
  '## Docs (títulos # e ## com a linha)',
  '',
];

for (const doc of docs) {
  partes.push(`### ${relative(RAIZ, doc)}`, ...titulosDoDoc(doc), '');
}

partes.push('## Código em src/ (primeira linha de comentário ou primeiro export)', '');

for (const arquivo of listarRecursivo(join(RAIZ, 'src'))) {
  partes.push(`- ${relative(RAIZ, arquivo)}: ${resumoDoArquivo(arquivo)}`);
}

writeFileSync(SAIDA, partes.join('\n') + '\n');
console.log(`Mapa gravado em ${relative(RAIZ, SAIDA)} (${docs.length} docs).`);
