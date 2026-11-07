import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const bloco = (page: Page) => page.getByTestId('bloco');
const tela = (page: Page) => page.getByTestId('tela');

async function createSubject(page: Page, name: string) {
  await page.keyboard.press('Alt+Digit3');
  await expect(bloco(page)).toHaveText('acervo.materias');
  await page.keyboard.press('Alt+KeyN');
  await page.keyboard.type(name);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: new RegExp(name) })).toBeVisible();
}

test.describe('banco real (OPFS), começando vazio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await expect(tela(page)).toHaveText('hub');
  });

  test('o banco novo é vazio, sem o aviso de exemplo, e nenhuma tela quebra', async ({ page }) => {
    await expect(page.getByText('Dados de exemplo')).toHaveCount(0);
    for (const digit of [2, 3, 4, 5, 6, 1]) {
      await page.keyboard.press(`Alt+Digit${digit}`);
      await expect(page.getByRole('main')).toBeVisible();
    }
    await expect(page.getByTestId('erro')).toHaveCount(0);
  });

  test('a matéria criada continua lá depois de recarregar', async ({ page }) => {
    await createSubject(page, 'Anatomia Geral');
    await page.reload();
    await expect(tela(page)).toHaveText('hub');
    await page.keyboard.press('Alt+Digit3');
    await expect(page.getByRole('button', { name: /Anatomia Geral/ })).toBeVisible();
  });

  test('o texto das Anotações sobrevive a recarregar logo depois de digitar', async ({ page }) => {
    await createSubject(page, 'Fisiologia');
    await page.getByRole('button', { name: /Fisiologia/ }).click();
    await page.keyboard.press('Alt+KeyN');
    await page.keyboard.type('Módulo');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-block="acervo.pastas"]')).toContainText('Módulo');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Alt+KeyN');
    await page.keyboard.type('Aula um');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-block="acervo.aulas"]')).toContainText('Aula um');
    await page.keyboard.press('Alt+Digit2');
    const editor = page.getByRole('textbox', { name: 'Anotações' });
    await expect(editor).toBeVisible();
    await editor.fill('texto guardado no disco');
    // Com a máquina carregada, fechar antes de a gravação chegar ao Worker pode perder o texto.
    await page.waitForTimeout(500);
    await page.reload();
    await expect(tela(page)).toHaveText('hub');
    await page.keyboard.press('Alt+Digit2');
    await expect(page.getByRole('textbox', { name: 'Anotações' })).toHaveText(
      'texto guardado no disco',
    );
  });

  test('Exportar banco baixa um arquivo com conteúdo', async ({ page }) => {
    await page.keyboard.press('Alt+Digit6');
    for (let step = 0; step < 3; step += 1) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    const download = page.waitForEvent('download');
    await page.keyboard.press('Enter');
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^ohara-\d{4}-\d{2}-\d{2}\.sqlite3$/);
    const path = await file.path();
    expect(readFileSync(path).length).toBeGreaterThan(0);
  });

  test('Sobre mostra o armazenamento e o SQLite', async ({ page }) => {
    await page.keyboard.press('Alt+Digit6');
    for (let step = 0; step < 5; step += 1) await page.keyboard.press('ArrowDown');
    await expect(page.getByText('Armazenamento persistente')).toBeVisible();
    await expect(page.getByText(/Versão 3\./)).toBeVisible();
  });

  test('uma segunda aba mostra o aviso de outra aba aberta', async ({ context }) => {
    const second = await context.newPage();
    await second.goto('./');
    await expect(second.getByTestId('erro')).toHaveAttribute('data-code', 'outra-aba');
    await expect(second.getByText(/já está aberto em outra aba/)).toBeVisible();
  });
});
