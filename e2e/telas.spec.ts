import { expect, test, type Page } from '@playwright/test';

const bloco = (page: Page) => page.getByTestId('bloco');
const nivel = (page: Page) => page.getByTestId('nivel');
const tela = (page: Page) => page.getByTestId('tela');
const selecionado = (page: Page, id: string) =>
  page.locator(`[data-block="${id}"] [data-sel="true"]`);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await expect(bloco(page)).toHaveText('hub.agenda');
});

test('o Hub nasce na aula de agora, e Enter abre a aula na Mesa', async ({ page }) => {
  await expect(selecionado(page, 'hub.agenda')).toContainText('Imunologia');
  await page.keyboard.press('Enter');
  await expect(tela(page)).toHaveText('mesa');
  await expect(page.getByRole('textbox', { name: 'Anotações' })).toBeFocused();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Resposta inflamatória aguda');
});

test('Acervo: a 3ª aula do 2º bimestre custa as teclas previstas', async ({ page }) => {
  await page.keyboard.press('Alt+Digit3');
  await expect(bloco(page)).toHaveText('acervo.materias');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('acervo.pastas');
  await expect(selecionado(page, 'acervo.pastas')).toContainText('2º bimestre');
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('acervo.aulas');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('heading', { level: 2, name: 'Tolerância' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(tela(page)).toHaveText('mesa');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tolerância e autoimunidade');
});

test('Acervo: filtro na régua, bordas e volta com Esc', async ({ page }) => {
  await page.keyboard.press('Alt+Digit3');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('acervo.pastas');
  await page.keyboard.press('ArrowLeft');
  await expect(selecionado(page, 'acervo.pastas')).toContainText('1º bimestre');
  await expect(page.locator('[data-block="acervo.aulas"] [data-nav-index]')).toHaveCount(3);
  await page.keyboard.press('ArrowDown');
  await expect(bloco(page)).toHaveText('acervo.aulas');
  await page.keyboard.press('ArrowRight');
  await expect(bloco(page)).toHaveText('acervo.previa');
  await page.keyboard.press('ArrowLeft');
  await expect(bloco(page)).toHaveText('acervo.aulas');
  await page.keyboard.press('ArrowUp');
  await expect(bloco(page)).toHaveText('acervo.pastas');

  await page.keyboard.press('Escape');
  await expect(nivel(page)).toHaveText('bloco');
  await page.keyboard.press('Escape');
  await expect(bloco(page)).toHaveText('acervo.materias');
  await expect(selecionado(page, 'acervo.materias')).toContainText('Imunologia');
});

test('Acervo: a régua de anos filtra as matérias', async ({ page }) => {
  await page.keyboard.press('Alt+Digit3');
  await page.keyboard.press('ArrowUp');
  await expect(bloco(page)).toHaveText('acervo.anos');
  await page.keyboard.press('ArrowLeft');
  await expect(selecionado(page, 'acervo.anos')).toContainText('1º ano');
  await expect(page.locator('[data-block="acervo.materias"] [data-nav-index]')).toHaveCount(1);
});

test('o Acervo lembra a matéria ao voltar de outra tela', async ({ page }) => {
  await page.keyboard.press('Alt+Digit3');
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('acervo.pastas');
  await page.keyboard.press('Alt+Digit1');
  await page.keyboard.press('Alt+Digit3');
  await expect(bloco(page)).toHaveText('acervo.pastas');
});

test('Alt I cria um lembrete que aparece no Hub', async ({ page }) => {
  await page.keyboard.press('Alt+KeyI');
  await expect(page.getByTestId('lembrete')).toBeVisible();
  await page.keyboard.type('Comprar luvas');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('lembrete')).toBeHidden();
  await expect(page.locator('[data-block="hub.lembretes"]')).toContainText('Comprar luvas');
});

test('Treino: Espaço vira, número responde, Errei volta para a fila', async ({ page }) => {
  await page.keyboard.press('Alt+Digit4');
  await expect(bloco(page)).toHaveText('treino.baralhos');
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('treino.cartao');
  const antes = await page.locator('[data-block="treino.cartao"] p').first().textContent();
  await page.keyboard.press('Digit3');
  await expect(page.locator('[data-block="treino.cartao"] p').first()).toHaveText(antes ?? '');
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Bom' })).toBeVisible();
  await page.keyboard.press('Digit3');
  await expect(page.locator('[data-block="treino.cartao"] p').first()).not.toHaveText(antes ?? '');
  await expect(page.getByText(/^1 de/)).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(bloco(page)).toHaveText('treino.baralhos');
});

test('Agenda: a régua troca a visão e o dia comanda o painel', async ({ page }) => {
  await page.keyboard.press('Alt+Digit5');
  await expect(bloco(page)).toHaveText('agenda.semana');
  await page.keyboard.press('ArrowUp');
  await expect(bloco(page)).toHaveText('agenda.visao');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-block="agenda.mes"]')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('agenda.mes');
  await page.keyboard.press('ArrowRight');
  await expect(selecionado(page, 'agenda.mes')).toHaveCount(1);
});

test('o calendário do Hub abre o dia na Agenda', async ({ page }) => {
  await page.keyboard.press('Alt+KeyH');
  await expect(bloco(page)).toHaveText('hub.calendario');
  await page.keyboard.press('Enter');
  await expect(tela(page)).toHaveText('agenda');
  await expect(bloco(page)).toHaveText('agenda.mes');
});

test('Configs: a seção comanda o detalhe, e Enter executa', async ({ page }) => {
  await page.keyboard.press('Alt+Digit6');
  await expect(bloco(page)).toHaveText('configs.secoes');
  const tema = () => page.evaluate(() => document.documentElement.dataset.tema);
  const antes = await tema();
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('configs.detalhe');
  await page.keyboard.press('Enter');
  expect(await tema()).not.toBe(antes);
});

test('janela de consulta abre pela Paleta e devolve o lugar', async ({ page }) => {
  await page.keyboard.press('Alt+KeyP');
  await page.keyboard.type('provas');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('consulta-provas')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('consulta-provas')).toBeHidden();
  await expect(bloco(page)).toHaveText('hub.agenda');
});
