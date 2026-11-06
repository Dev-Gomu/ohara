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

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'node_modules'] },
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
