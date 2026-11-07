import { expect, test, type Page } from '@playwright/test';
import { KEYS } from '../src/core/keyboard/keys';

const nivel = (page: Page) => page.getByTestId('nivel');
const bloco = (page: Page) => page.getByTestId('bloco');
const tela = (page: Page) => page.getByTestId('tela');
const ultimaAcao = (page: Page) => page.getByTestId('ultima-acao');
const ajuda = (page: Page) => page.getByTestId('ajuda');
const anotacoes = (page: Page) => page.getByRole('textbox', { name: 'Anotações' });

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
  await expect(bloco(page)).toHaveText('mesa.notes');
});

test('Alt 2 chega com o cursor nas Anotações', async ({ page }) => {
  await expect(nivel(page)).toHaveText('campo');
  await expect(anotacoes(page)).toBeFocused();
  await page.keyboard.type('hjkl');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.type('x');
  await page.keyboard.press('Enter');
  await expect(anotacoes(page)).toHaveValue('hjkx\nl');
  await expect(nivel(page)).toHaveText('campo');
});

test('Esc sobe, Enter desce, e o menu é o teto', async ({ page }) => {
  await page.keyboard.press('Escape');
  await expect(nivel(page)).toHaveText('bloco');
  await expect(anotacoes(page)).not.toBeFocused();
  await page.keyboard.press('Escape');
  await expect(nivel(page)).toHaveText('menu');
  await page.keyboard.press('Escape');
  await expect(nivel(page)).toHaveText('menu');
  await page.keyboard.press('Enter');
  await expect(tela(page)).toHaveText('mesa');
  await expect(nivel(page)).toHaveText('bloco');
  await page.keyboard.press('Enter');
  await expect(anotacoes(page)).toBeFocused();
});

test('Alt H J K L andam pelos blocos e mantêm a profundidade', async ({ page }) => {
  await page.keyboard.press('Alt+KeyH');
  await expect(bloco(page)).toHaveText('mesa.slides');
  await expect(nivel(page)).toHaveText('bloco');
  await page.keyboard.press('Alt+KeyJ');
  await expect(bloco(page)).toHaveText('mesa.cards');
  await page.keyboard.press('Alt+KeyL');
  await expect(bloco(page)).toHaveText('mesa.notes');
});

test('nos Cartões, setas andam na grade e saem pela borda', async ({ page }) => {
  await page.keyboard.press('Alt+KeyH');
  await page.keyboard.press('Alt+KeyJ');
  await expect(bloco(page)).toHaveText('mesa.cards');
  await page.keyboard.press('Enter');
  await expect(nivel(page)).toHaveText('campo navegável');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-block="mesa.cards"] [data-sel="true"]')).toContainText('PCR');
  await page.keyboard.press('ArrowRight');
  await expect(bloco(page)).toHaveText('mesa.notes');
  await expect(anotacoes(page)).toBeFocused();
});

test('Alt S fecha e reabre o bloco, sem perder o texto', async ({ page }) => {
  await page.keyboard.type('abc');
  const slides = page.locator('[data-block="mesa.slides"]');
  await page.keyboard.press('Alt+KeyS');
  await expect(slides).toHaveCount(0);
  await page.keyboard.press('Alt+KeyS');
  await expect(slides).toBeVisible();
  await expect(bloco(page)).toHaveText('mesa.slides');
  await expect(anotacoes(page)).toHaveValue('abc');
});

test('Alt M amplia e volta, e o texto continua', async ({ page }) => {
  await page.keyboard.type('abc');
  await page.keyboard.press('Alt+KeyM');
  await expect(page.locator('[data-block="mesa.slides"]')).toBeHidden();
  await expect(anotacoes(page)).toBeFocused();
  await page.keyboard.press('Alt+KeyM');
  await expect(page.locator('[data-block="mesa.slides"]')).toBeVisible();
  await expect(anotacoes(page)).toHaveValue('abc');
});

test('Alt Shift H troca o bloco de lugar e Alt Shift 0 desfaz', async ({ page }) => {
  const x = (id: string) =>
    page.locator(`[data-block="${id}"]`).evaluate((el) => el.getBoundingClientRect().x);
  await page.waitForTimeout(300);
  const antes = await x('mesa.notes');
  await page.keyboard.press('Alt+Shift+KeyH');
  expect(await x('mesa.notes')).toBeLessThan(antes);
  await page.keyboard.press('Alt+Shift+Digit0');
  await expect.poll(() => x('mesa.notes')).toBeCloseTo(antes, 0);
});

test('Alt R redimensiona com as setas até Esc', async ({ page }) => {
  const largura = () =>
    page.locator('[data-block="mesa.notes"]').evaluate((el) => el.getBoundingClientRect().width);
  const antes = await largura();
  await page.keyboard.press('Alt+KeyR');
  await expect(page.getByText('Redimensionar:')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(largura).toBeGreaterThan(antes);
  await page.keyboard.press('Escape');
  await expect(page.getByText('Redimensionar:')).toBeHidden();
  await expect(nivel(page)).toHaveText('bloco');
});

test('Alt ] passa o slide sem tirar o cursor das Anotações', async ({ page }) => {
  await page.keyboard.press('Alt+Backslash');
  await expect(page.getByText('Página 15')).toBeVisible();
  await expect(anotacoes(page)).toBeFocused();
});

test('Alt / abre a ajuda com toda a tabela, e Esc fecha sem mudar o nível', async ({ page }) => {
  await pressAltSlash(page);
  await expect(ajuda(page)).toBeVisible();
  await expect(page.getByTestId('atalho')).toHaveCount(KEYS.length);
  await page.keyboard.press('Escape');
  await expect(ajuda(page)).toBeHidden();
  await expect(nivel(page)).toHaveText('campo');
  await expect(anotacoes(page)).toBeFocused();
});

test('com a ajuda aberta, teclas da tabela ficam bloqueadas', async ({ page }) => {
  await page.keyboard.press('F1');
  await expect(ajuda(page)).toBeVisible();
  await page.keyboard.press('Alt+Digit1');
  await expect(tela(page)).toHaveText('mesa');
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

test('o menu ⋮ escolhe com setas e Esc fecha antes de subir de nível', async ({ page }) => {
  await page.keyboard.press('Alt+KeyO');
  await expect(page.getByTestId('opcoes')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('opcoes')).toBeHidden();
  await expect(nivel(page)).toHaveText('campo');
  await page.keyboard.press('Alt+KeyO');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-block="mesa.slides"]')).toBeHidden();
});

test('tocar num campo põe o nível em campo, e tocar no bloco sai dele', async ({ page }) => {
  await page.getByRole('heading', { name: 'Slides' }).click();
  await expect(nivel(page)).toHaveText('bloco');
  await expect(bloco(page)).toHaveText('mesa.slides');
  await anotacoes(page).click();
  await expect(nivel(page)).toHaveText('campo');
  await expect(bloco(page)).toHaveText('mesa.notes');
  await page.getByRole('button', { name: 'Acervo' }).click();
  await expect(tela(page)).toHaveText('acervo');
});

test('a última ação registra teclas da tabela', async ({ page }) => {
  await page.keyboard.press('Control+KeyK');
  await expect(ultimaAcao(page)).toHaveText('Ctrl K · Link');
});

test('Alt 1 a 6 trocam de tela e a tela lembra o foco', async ({ page }) => {
  await page.keyboard.press('Alt+KeyH');
  await expect(bloco(page)).toHaveText('mesa.slides');
  await page.keyboard.press('Alt+Digit3');
  await expect(tela(page)).toHaveText('acervo');
  await page.keyboard.press('Alt+Digit2');
  await expect(bloco(page)).toHaveText('mesa.slides');
});

test('no menu, setas escolhem a tela e Enter abre', async ({ page }) => {
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(nivel(page)).toHaveText('menu');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(tela(page)).toHaveText('acervo');
  await expect(nivel(page)).not.toHaveText('menu');
});

test('a Paleta filtra e leva à tela escolhida', async ({ page }) => {
  await page.keyboard.press('Alt+KeyP');
  await expect(page.getByTestId('paleta')).toBeVisible();
  await page.keyboard.type('trei');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('paleta')).toBeHidden();
  await expect(tela(page)).toHaveText('treino');
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
