import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const tela = (page: Page) => page.getByTestId('tela');
const janela = (page: Page) => page.getByTestId('pergunta');
const PHRASE = 'frase de acesso do teste';

async function criarMateria(page: Page, name: string) {
  await page.keyboard.press('Alt+Digit3');
  await page.keyboard.press('Alt+KeyN');
  await page.keyboard.type(name);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: new RegExp(name) })).toBeVisible();
  await page.waitForTimeout(500);
}

async function abrirNotas(page: Page) {
  await page.getByRole('button', { name: 'Notas', exact: true }).click();
}

async function preencher(page: Page, valores: string[]) {
  const campos = janela(page).locator('input, textarea, select');
  for (const [indice, valor] of valores.entries()) {
    const campo = campos.nth(indice);
    if ((await campo.evaluate((el) => el.tagName)) === 'SELECT') await campo.selectOption(valor);
    else await campo.fill(valor);
  }
}

test('Notas: frase, código, itens com média parcial, trava, destrava e arquivo só cifrado', async ({
  page,
}) => {
  await page.goto('./');
  await expect(tela(page)).toHaveText('hub');
  await criarMateria(page, 'Cardiologia');
  await abrirNotas(page);

  await page.getByRole('button', { name: 'Criar a frase de acesso' }).click();
  await preencher(page, [PHRASE, PHRASE]);
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('codigo-recuperacao')).toHaveText(
    /^[A-Z2-7]{4}(-[A-Z2-7]{4}){4}$/,
    { timeout: 20000 },
  );
  await page.getByRole('button', { name: /Anotei o código/ }).click();
  await expect(page.getByRole('heading', { name: 'Itens de CAR' })).toBeVisible({ timeout: 20000 });

  await page.keyboard.press('Alt+KeyN');
  await preencher(page, ['Prova segredo azul', '1', '1', '8', '0', 'nenhum']);
  await page.keyboard.press('Enter');
  await expect(page.getByText('Prova segredo azul')).toBeVisible();
  await page.keyboard.press('Alt+KeyN');
  await preencher(page, ['Prova pendente', '1', '1', '-', '0', 'nenhum']);
  await page.keyboard.press('Enter');
  await expect(page.getByText('8,0 (parcial)').first()).toBeVisible();

  await page.waitForTimeout(600);
  const baixar = page.waitForEvent('download');
  await page.keyboard.press('Alt+Digit6');
  await page.getByRole('button', { name: /Backup/ }).click();
  await page.getByRole('button', { name: /Exportar banco/ }).click();
  const bytes = readFileSync((await (await baixar).path()) as string);
  expect(bytes.includes(Buffer.from('Prova segredo azul'))).toBe(false);
  expect(bytes.includes(Buffer.from('Cardiologia'))).toBe(true);

  await page.reload();
  await expect(tela(page)).toHaveText('hub');
  await abrirNotas(page);
  await expect(page.getByText('As notas estão travadas')).toBeVisible();
  await expect(page.getByText('Prova segredo azul')).toHaveCount(0);
  await page.getByRole('button', { name: 'Abrir com a frase' }).click();
  await preencher(page, ['frase errada completa']);
  await page.keyboard.press('Enter');
  await expect(page.getByText('As notas estão travadas')).toBeVisible();
  await page.getByRole('button', { name: 'Abrir com a frase' }).click();
  await preencher(page, [PHRASE]);
  await page.keyboard.press('Enter');
  await expect(page.getByText('Prova segredo azul')).toBeVisible({ timeout: 20000 });
});
