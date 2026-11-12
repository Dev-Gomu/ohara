import { expect, test, type Page } from '@playwright/test';

const bloco = (page: Page) => page.getByTestId('bloco');
const anotacoes = (page: Page) => page.getByRole('textbox', { name: 'Anotações' });
const pagina = (page: Page) => page.getByTestId('pagina-pdf');

async function anexar(page: Page) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Anexar PDF' }).click();
  await (await chooser).setFiles('e2e/fixtures/aula.pdf');
  await expect(page.getByText('"aula.pdf" anexado (3 páginas).')).toBeVisible();
  await expect(pagina(page)).toHaveAttribute('data-page', '1');
}

test('anexa um PDF, passa a página com Alt ] e tudo continua depois de recarregar', async ({
  page,
}) => {
  await page.goto('./?exemplo');
  await expect(bloco(page)).toHaveText('hub.agenda');
  await page.keyboard.press('Alt+Digit2');
  await expect(bloco(page)).toHaveText('mesa.notes');
  await anexar(page);

  await anotacoes(page).click();
  await expect(anotacoes(page)).toBeFocused();
  await page.keyboard.press('Alt+Backslash');
  await expect(pagina(page)).toHaveAttribute('data-page', '2');
  await expect(anotacoes(page)).toBeFocused();
  await page.keyboard.press('Alt+Backslash');
  await page.keyboard.press('Alt+Backslash');
  await expect(pagina(page)).toHaveAttribute('data-page', '3');

  await page.waitForTimeout(600);
  await page.reload();
  await expect(bloco(page)).toHaveText('hub.agenda');
  await page.keyboard.press('Alt+Digit2');
  await expect(pagina(page)).toHaveAttribute('data-page', '3');
  await expect(page.getByTestId('erro')).toHaveCount(0);
});
