import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const bare = { regex: '^[^.]', message: 'Pacote externo não é permitido nesta camada.' };
const toData = {
  group: ['**/data', '**/data/**'],
  message: 'Esta camada não pode importar data (D45).',
};
const toUi = { group: ['**/ui', '**/ui/**'], message: 'Camada inferior não importa ui (D45).' };

const keyEvent = '/^key(down|up|press)$/';
const keyMessage =
  'Tecla nova entra na tabela de teclas: só o listener único escuta teclado (D15).';
const noLooseKeys = [
  {
    selector: 'JSXAttribute[name.name=/^onKey(Down|Up|Press)(Capture)?$/]',
    message: keyMessage,
  },
  {
    selector: `CallExpression[callee.name='addEventListener'][arguments.0.value=${keyEvent}]`,
    message: keyMessage,
  },
  {
    selector: `CallExpression[callee.property.name='addEventListener'][arguments.0.value=${keyEvent}]`,
    message: keyMessage,
  },
  {
    selector: 'AssignmentExpression[left.property.name=/^onkey(down|up|press)$/]',
    message: keyMessage,
  },
];

export default tseslint.config(
  {
    ignores: [
      'dist',
      'dev-dist',
      'node_modules',
      'public/prototipo-teclado',
      'playwright-report',
      'test-results',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/ui/keyboard/listener.ts'],
    rules: { 'no-restricted-syntax': ['error', ...noLooseKeys] },
  },
  {
    // core: TypeScript puro, sem imports externos nem de outras camadas
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [bare, toData, toUi] }],
    },
  },
  {
    files: ['src/core/**/*.test.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [toData, toUi] }] },
  },
  {
    // data: importa só core
    files: ['src/data/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [toUi] }] },
  },
  {
    // ui: nunca toca data
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [toData] }] },
  },
);
