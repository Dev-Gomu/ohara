import { expect, test, type Page } from '@playwright/test';

const bloco = (page: Page) => page.getByTestId('bloco');

test.beforeEach(async ({ page }) => {
  await page.goto('./?exemplo');
  await expect(bloco(page)).toHaveText('hub.agenda');
});

test('Acervo: Alt O renomeia a matéria', async ({ page }) => {
  await page.keyboard.press('Alt+Digit3');
  await expect(bloco(page)).toHaveText('acervo.materias');
  await page.keyboard.press('Alt+KeyO');
  await page.getByRole('menuitem', { name: 'Renomear matéria' }).click();
  await page.getByRole('textbox', { name: 'Nome' }).fill('Matéria Renomeada');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: /Matéria Renomeada/ })).toBeVisible();
});

test('Acervo: excluir matéria e Alt Z desfaz', async ({ page }) => {
  await page.keyboard.press('Alt+Digit3');
  await expect(bloco(page)).toHaveText('acervo.materias');
  const cards = page.locator('[data-block="acervo.materias"] button');
  const before = await cards.count();
  await page.keyboard.press('Alt+KeyO');
  await page.getByRole('menuitem', { name: 'Excluir matéria' }).click();
  await expect(page.getByTestId('desfazer')).toContainText('excluída');
  await expect(cards).toHaveCount(before - 1);
  await page.keyboard.press('Alt+KeyZ');
  await expect(cards).toHaveCount(before);
  await expect(page.getByTestId('desfazer')).toBeHidden();
});

test('Acervo: excluir uma aula pelo menu do bloco', async ({ page }) => {
  await page.keyboard.press('Alt+Digit3');
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('acervo.pastas');
  await page.keyboard.press('ArrowDown');
  const lessons = page.locator('[data-block="acervo.aulas"] [data-sel]');
  const before = await lessons.count();
  expect(before).toBeGreaterThan(0);
  await page.keyboard.press('Alt+KeyO');
  await page.getByRole('menuitem', { name: 'Excluir aula' }).click();
  await expect(lessons).toHaveCount(before - 1);
});

test('Mesa: Alt B vai à barra de formatação, Alt . anda e Enter aplica', async ({ page }) => {
  await page.keyboard.press('Alt+Digit2');
  const editor = page.getByRole('textbox', { name: 'Anotações' });
  await expect(editor).toBeFocused();
  await editor.fill('texto');
  await page.keyboard.press('Control+KeyA');
  await page.keyboard.press('Alt+KeyB');
  const bar = page.getByRole('toolbar', { name: 'Formatação' });
  await expect(bar.getByRole('button').first()).toBeFocused();
  await page.keyboard.press('Alt+Period');
  await expect(bar.getByRole('button').nth(1)).toBeFocused();
  await page.keyboard.press('Alt+Comma');
  await expect(bar.getByRole('button').first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(editor.locator('strong')).toHaveText('texto');
});

test('Mesa: a barra nasce oculta, a bolha aparece ao selecionar e Alt T mostra a barra', async ({
  page,
}) => {
  await page.keyboard.press('Alt+Digit2');
  const editor = page.getByRole('textbox', { name: 'Anotações' });
  const bar = page.getByRole('toolbar', { name: 'Formatação' });
  await expect(editor).toBeFocused();
  await editor.fill('texto');
  await expect(bar).toHaveCount(0);
  await page.keyboard.press('Control+KeyA');
  await expect(bar).toHaveCount(1);
  await bar.getByRole('button', { name: 'N' }).click();
  await expect(editor.locator('strong')).toHaveText('texto');
  await page.keyboard.press('ArrowRight');
  await expect(bar).toHaveCount(0);
  await page.keyboard.press('Alt+KeyT');
  await expect(bar).toHaveCount(1);
  await page.keyboard.press('Alt+KeyT');
  await expect(bar).toHaveCount(0);
});
