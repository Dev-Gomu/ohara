// Gera docs/pecas.md (D134): o que cada peça de ui/components, a store do teclado e ui/study
// exportam (assinatura e comentário). Para usar uma peça, leia o cartão, não o código.
// Uso: node scripts/pecas.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const SAIDA = join(RAIZ, 'docs', 'pecas.md');
const ORIGENS = [
  ['Peças (src/ui/components)', 'src/ui/components', /\.tsx?$/],
  ['Store do teclado e das telas (src/ui/keyboard)', 'src/ui/keyboard', /^store\.ts$/],
  ['Estudo (src/ui/study)', 'src/ui/study', /\.ts$/],
];

const compacto = (texto) => texto.replace(/\/\/[^\n]*/g, '').replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/, \)/g, ')').trim();

function comentarioDe(fonte, no) {
  const brutos = ts.getLeadingCommentRanges(fonte.text, no.getFullStart()) ?? [];
  return brutos
    .map((c) => fonte.text.slice(c.pos, c.end))
    .filter((t) => t.startsWith('//'))
    .map((t) => t.replace(/^\/\/\s?/, ''))
    .join(' ')
    .trim();
}

function exportado(no) {
  return no.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function assinatura(fonte, no) {
  const txt = (n) => n.getText(fonte);
  if (ts.isFunctionDeclaration(no) && no.name) {
    const params = no.parameters.map(txt).join(', ');
    const ret = no.type ? `: ${txt(no.type)}` : '';
    return `function ${no.name.text}(${params})${ret}`;
  }
  if (ts.isVariableStatement(no)) {
    return no.declarationList.declarations
      .map((d) => {
        const init = d.initializer;
        if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
          const params = init.parameters.map(txt).join(', ');
          return `const ${txt(d.name)} = (${params})${init.type ? `: ${txt(init.type)}` : ''} =>`;
        }
        return `const ${txt(d.name)}${d.type ? `: ${txt(d.type)}` : ''}`;
      })
      .join('; ');
  }
  if (ts.isTypeAliasDeclaration(no) || ts.isInterfaceDeclaration(no)) {
    return txt(no).replace(/^export\s+/, '');
  }
  if (ts.isEnumDeclaration(no)) return `enum ${no.name.text}`;
  return null;
}

function cartaoDoArquivo(caminho) {
  const texto = readFileSync(join(RAIZ, caminho), 'utf8');
  const fonte = ts.createSourceFile(caminho, texto, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const tipos = new Map();
  for (const no of fonte.statements) {
    if ((ts.isTypeAliasDeclaration(no) || ts.isInterfaceDeclaration(no)) && !exportado(no)) {
      tipos.set(no.name.text, compacto(no.getText(fonte)));
    }
  }
  const itens = [];
  for (const no of fonte.statements) {
    if (!exportado(no)) continue;
    const sig = assinatura(fonte, no);
    if (!sig) continue;
    const nota = comentarioDe(fonte, no);
    const usados = [...tipos].filter(([nome]) => new RegExp(`\\b${nome}\\b`).test(sig));
    const extras = usados.map(([, def]) => `\n  \`${def}\``).join('');
    itens.push(`- \`${compacto(sig)}\`${nota ? `\n  ${nota}` : ''}${extras}`);
  }
  return itens;
}

const partes = ['<!-- Gerado por `node scripts/pecas.mjs`. Não editar à mão. -->', '# Cartão de peças', ''];
let total = 0;
for (const [titulo, pasta, filtro] of ORIGENS) {
  partes.push(`## ${titulo}`, '');
  const arquivos = readdirSync(join(RAIZ, pasta)).filter((n) => filtro.test(n)).sort();
  for (const nome of arquivos) {
    const itens = cartaoDoArquivo(join(pasta, nome));
    if (!itens.length) continue;
    total += itens.length;
    partes.push(`### ${nome}`, ...itens, '');
  }
}
writeFileSync(SAIDA, partes.join('\n'));
console.log(`docs/pecas.md: ${total} exports, ${partes.length} linhas.`);
