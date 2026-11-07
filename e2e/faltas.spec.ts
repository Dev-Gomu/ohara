import { expect, test, type Page } from '@playwright/test';

const bloco = (page: Page) => page.getByTestId('bloco');
const aulas = (page: Page) => page.locator('[data-block="faltas.aulas"]');
const resumo = (page: Page) => page.locator('[data-block="faltas.resumo"]');

test('Faltas: marca falta e aula cancelada e o resumo recalcula', async ({ page }) => {
  await page.goto('./?exemplo');
  await expect(bloco(page)).toHaveText('hub.agenda');
  await page.getByRole('button', { name: 'Faltas', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Faltas' })).toBeVisible();
  await page.locator('[data-block="faltas.materias"]').getByRole('button', { name: /FAR/ }).click();
  await expect(aulas(page)).toContainText('Aulas de FAR');
  await expect(resumo(page)).toContainText('Faltas0 h');
  const total = await resumo(page).locator('dd').nth(1).innerText();

  await aulas(page).locator('[data-nav-index]').first().click();
  await page.getByTestId('pergunta').locator('select').first().selectOption('falta');
  await page.getByTestId('pergunta').getByRole('button', { name: /Salvar/ }).click();
  await expect(aulas(page)).toContainText('faltei');
  await expect(resumo(page).locator('dd').nth(2)).not.toHaveText('0 h');

  await aulas(page).locator('[data-nav-index]').nth(1).click();
  await page.getByTestId('pergunta').locator('select').first().selectOption('cancelada');
  await page.getByTestId('pergunta').getByRole('button', { name: /Salvar/ }).click();
  await expect(aulas(page)).toContainText('aula cancelada');
  await expect(resumo(page).locator('dd').nth(1)).not.toHaveText(total);

  await page.keyboard.press('Escape');
});
