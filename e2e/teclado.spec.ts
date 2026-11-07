import { expect, test, type Page } from '@playwright/test';
import { KEYS } from '../src/core/keyboard/keys';

const nivel = (page: Page) => page.getByTestId('nivel');
const bloco = (page: Page) => page.getByTestId('bloco');
const ultimaAcao = (page: Page) => page.getByTestId('ultima-acao');
const ajuda = (page: Page) => page.getByTestId('ajuda');
const campo = (page: Page, nome: string) => page.getByRole('textbox', { name: nome });

// O Playwright não conhece a tecla IntlRo (o / do ABNT2), então ela vai direto pelo Chromium.
async function pressAltSlash(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  const key = { code: 'IntlRo', key: '/', windowsVirtualKeyCode: 193, modifiers: 1 };
  await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...key });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await expect(bloco(page)).toHaveText('hub.provas');
  await page.keyboard.press('Alt+Digit2');
  await expect(bloco(page)).toHaveText('mesa.slides');
});

test('Enter desce e Esc sobe, sem passar do menu', async ({ page }) => {
  await page.keyboard.press('Enter');
  await expect(nivel(page)).toHaveText('campo');
  await expect(campo(page, 'Slides')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(nivel(page)).toHaveText('bloco');
  await expect(campo(page, 'Slides')).not.toBeFocused();

  await page.keyboard.press('Escape');
  await expect(nivel(page)).toHaveText('menu');

  await page.keyboard.press('Escape');
  await expect(nivel(page)).toHaveText('menu');

  await page.keyboard.press('Enter');
  await expect(nivel(page)).toHaveText('bloco');
  await expect(page.getByTestId('tela')).toHaveText('mesa');
});

test('Alt H J K L andam pelos blocos e mantêm o nível campo', async ({ page }) => {
  await page.keyboard.press('Alt+KeyL');
  await expect(bloco(page)).toHaveText('mesa.notes');
  await page.keyboard.press('Alt+KeyL');
  await expect(bloco(page)).toHaveText('mesa.cards');
  await page.keyboard.press('Alt+KeyH');
  await expect(bloco(page)).toHaveText('mesa.notes');
  await page.keyboard.press('Alt+KeyH');
  await expect(bloco(page)).toHaveText('mesa.slides');

  await page.keyboard.press('Enter');
  await page.keyboard.press('Alt+KeyL');
  await expect(bloco(page)).toHaveText('mesa.notes');
  await expect(nivel(page)).toHaveText('campo');
  await expect(campo(page, 'Anotações')).toBeFocused();
});

test('sem Alt, H J K L e setas movem no bloco e são texto no campo', async ({ page }) => {
  await page.keyboard.press('KeyL');
  await expect(bloco(page)).toHaveText('mesa.notes');
  await page.keyboard.press('ArrowRight');
  await expect(bloco(page)).toHaveText('mesa.cards');

  await page.keyboard.press('Enter');
  await page.keyboard.type('hjkl');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.type('x');
  await page.keyboard.press('Enter');
  await expect(campo(page, 'Cartões')).toHaveValue('hjkx\nl');
  await expect(bloco(page)).toHaveText('mesa.cards');
  await expect(nivel(page)).toHaveText('campo');
});

test('Alt / abre a ajuda com toda a tabela, e Esc fecha sem mudar o nível', async ({ page }) => {
  await pressAltSlash(page);
  await expect(ajuda(page)).toBeVisible();
  await expect(ajuda(page)).toBeFocused();
  await expect(page.getByTestId('atalho')).toHaveCount(KEYS.length);
  for (const key of KEYS) {
    await expect(page.getByTestId('atalho').filter({ hasText: key.text }).first()).toBeVisible();
  }

  await page.keyboard.press('Escape');
  await expect(ajuda(page)).toBeHidden();
  await expect(nivel(page)).toHaveText('bloco');
});

test('F1 abre a ajuda, e o foco volta ao campo ao fechar', async ({ page }) => {
  await page.keyboard.press('Enter');
  await page.keyboard.type('abc');
  await page.keyboard.press('F1');
  await expect(ajuda(page)).toBeVisible();
  await expect(campo(page, 'Slides')).not.toBeFocused();

  await page.keyboard.press('Escape');
  await expect(ajuda(page)).toBeHidden();
  await expect(nivel(page)).toHaveText('campo');
  await expect(campo(page, 'Slides')).toBeFocused();
  await page.waitForTimeout(100);
  await expect(campo(page, 'Slides')).toBeFocused();
  await page.keyboard.type('d');
  await expect(campo(page, 'Slides')).toHaveValue('abcd');
});

test('com a ajuda aberta, teclas da tabela ficam bloqueadas', async ({ page }) => {
  await page.keyboard.press('F1');
  await expect(ajuda(page)).toBeVisible();
  await expect(ultimaAcao(page)).toContainText('F1');

  await page.keyboard.press('Alt+Digit1');
  await page.keyboard.press('Alt+ArrowLeft');
  await expect(ultimaAcao(page)).toContainText('F1');
  await expect(ajuda(page)).toBeVisible();
});

test('a ajuda rola com as setas, sem passar da tela', async ({ page }) => {
  await page.keyboard.press('F1');
  await expect(ajuda(page)).toBeFocused();
  const altura = await ajuda(page).evaluate((element) => element.clientHeight);
  expect(altura).toBeLessThanOrEqual(page.viewportSize()?.height ?? 0);

  await page.keyboard.press('ArrowDown');
  await expect.poll(() => ajuda(page).evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
});

test('o botão Fechar fecha a ajuda', async ({ page }) => {
  await page.getByRole('button', { name: 'Ajuda' }).click();
  await expect(ajuda(page)).toBeVisible();
  await page.getByRole('button', { name: 'Fechar' }).click();
  await expect(ajuda(page)).toBeHidden();
});

test('Esc fecha o menu ⋮ antes de subir de nível', async ({ page }) => {
  await page.keyboard.press('Alt+KeyO');
  await expect(page.getByTestId('opcoes')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('opcoes')).toBeHidden();
  await expect(nivel(page)).toHaveText('bloco');
});

test('tocar num campo põe o nível em campo, e tocar no bloco sai dele', async ({ page }) => {
  await campo(page, 'Cartões').click();
  await expect(nivel(page)).toHaveText('campo');
  await expect(bloco(page)).toHaveText('mesa.cards');

  await page.getByRole('heading', { name: 'Anotações' }).click();
  await expect(nivel(page)).toHaveText('bloco');
  await expect(bloco(page)).toHaveText('mesa.notes');

  await page.getByRole('button', { name: 'Acervo' }).click();
  await expect(page.getByTestId('tela')).toHaveText('acervo');
});

test('ações ainda sem tela aparecem como última ação', async ({ page }) => {
  await page.keyboard.press('Alt+Digit3');
  await expect(ultimaAcao(page)).toHaveText('Alt 3 · Acervo');
  await page.keyboard.press('Control+KeyP');
  await expect(ultimaAcao(page)).toHaveText('Ctrl P · Paleta: ir para…');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Alt+Digit2');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+KeyK');
  await expect(ultimaAcao(page)).toHaveText('Ctrl K · Link');
});

test('Alt 1 a 6 trocam de tela e a tela lembra o foco', async ({ page }) => {
  await page.keyboard.press('KeyL');
  await expect(bloco(page)).toHaveText('mesa.notes');
  await page.keyboard.press('Alt+Digit3');
  await expect(page.getByTestId('tela')).toHaveText('acervo');
  await page.keyboard.press('Alt+Digit2');
  await expect(bloco(page)).toHaveText('mesa.notes');
});

test('no menu, setas escolhem a tela e Enter abre', async ({ page }) => {
  await page.keyboard.press('Escape');
  await expect(nivel(page)).toHaveText('menu');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('tela')).toHaveText('acervo');
  await expect(nivel(page)).not.toHaveText('menu');
});

test('a Paleta filtra e leva à tela escolhida', async ({ page }) => {
  await page.keyboard.press('Alt+KeyP');
  await expect(page.getByTestId('paleta')).toBeVisible();
  await page.keyboard.type('trei');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('paleta')).toBeHidden();
  await expect(page.getByTestId('tela')).toHaveText('treino');
});

test('a Paleta troca o tema e Esc fecha sem agir', async ({ page }) => {
  const tema = () => page.evaluate(() => document.documentElement.dataset.tema);
  const antes = await tema();
  await page.keyboard.press('Alt+KeyP');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('paleta')).toBeHidden();
  expect(await tema()).toBe(antes);
  await page.keyboard.press('Alt+KeyP');
  await page.keyboard.type('tema');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('paleta')).toBeHidden();
  expect(await tema()).not.toBe(antes);
});
