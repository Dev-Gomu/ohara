import { expect, test, type Page } from '@playwright/test';

const bloco = (page: Page) => page.getByTestId('bloco');
const nivel = (page: Page) => page.getByTestId('nivel');
const tela = (page: Page) => page.getByTestId('tela');
const selecionado = (page: Page, id: string) =>
  page.locator(`[data-block="${id}"] [data-sel="true"]`);

test.beforeEach(async ({ page }) => {
  await page.goto('./?exemplo');
  await expect(bloco(page)).toHaveText('hub.agenda');
});

test('o Hub nasce na aula de agora, e Enter abre a aula na Mesa', async ({ page }) => {
  await expect(selecionado(page, 'hub.agenda')).toContainText('IMU');
  await page.keyboard.press('Enter');
  await expect(tela(page)).toHaveText('mesa');
  await expect(page.getByRole('textbox', { name: 'Anotações' })).toBeFocused();
  await expect(page.locator('nav h1')).toHaveText('Resposta inflamatória aguda');
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
  await expect(page.locator('nav h1')).toHaveText('Tolerância e autoimunidade');
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
  await expect(bloco(page)).toHaveText('treino.resumo');
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
  await expect(bloco(page)).toHaveText('treino.resumo');
});

test('Treino: escolher uma aula só treina os cartões dela', async ({ page }) => {
  await page.keyboard.press('Alt+Digit4');
  await page.keyboard.press('Alt+KeyF');
  await page.keyboard.type('imunologia');
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('treino.materias');
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('treino.resumo');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowRight');
  await expect(bloco(page)).toHaveText('treino.escolha');
  for (let step = 0; step < 9; step += 1) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  const resumo = page.locator('[data-block="treino.resumo"]');
  await expect(resumo).toContainText('Imunologia · 1 aula');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await expect(page.getByText(/^0 de 6$/)).toBeVisible();
});

test('Mesa: Alt T vai às abas dos cartões e as setas e H L trocam entre Novo e Salvos', async ({
  page,
}) => {
  await page.keyboard.press('Alt+Digit2');
  await page.keyboard.press('Alt+KeyN');
  await expect(bloco(page)).toHaveText('mesa.cards');
  await page.keyboard.press('Alt+KeyT');
  await expect(page.getByRole('button', { name: 'Novo' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: /^Salvos/ })).toHaveAttribute('data-sel', 'true');
  await page.keyboard.press('KeyH');
  await expect(page.getByRole('button', { name: 'Novo' })).toHaveAttribute('data-sel', 'true');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Novo' })).not.toBeFocused();
  await expect(nivel(page)).toHaveText('bloco');
});

test('Mesa: Alt N abre um cartão, Ctrl Enter salva os completos', async ({ page }) => {
  await page.keyboard.press('Alt+Digit2');
  await page.keyboard.press('Alt+KeyN');
  await expect(bloco(page)).toHaveText('mesa.cards');
  await page.keyboard.type('Quem libera IL-6?');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Macrófago');
  await page.keyboard.press('Alt+KeyN');
  await page.keyboard.type('Sem verso ainda');
  await page.keyboard.press('Control+Enter');
  const cartoes = page.locator('[data-block="mesa.cards"]');
  await expect(cartoes).toContainText('1 cartão salvo');
  await expect(cartoes.getByRole('button', { name: 'Salvos 7' })).toBeVisible();
  await expect(cartoes.locator('textarea')).toHaveValue('@ Sem verso ainda');
});

test('Agenda: a régua troca a visão e o dia comanda a prévia', async ({ page }) => {
  await page.keyboard.press('Alt+Digit5');
  await expect(bloco(page)).toHaveText('agenda.semana');
  // A chegada é a aula de agora, no meio do dia: ↑ andaria no dia, Alt K sobe à régua.
  await page.keyboard.press('Alt+KeyK');
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
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('consulta-provas')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('consulta-provas')).toBeHidden();
  await expect(bloco(page)).toHaveText('hub.agenda');
});

const editor = (page: Page) => page.getByRole('textbox', { name: 'Anotações' });

test('Anotações: teclas de formatação passam pela tabela', async ({ page }) => {
  await page.keyboard.press('Alt+Digit2');
  await expect(editor(page)).toBeFocused();
  await expect(editor(page)).not.toHaveText('');
  await editor(page).fill('');
  await page.keyboard.press('Control+KeyB');
  await page.keyboard.type('forte');
  await expect(editor(page).locator('strong')).toHaveText('forte');
  await page.keyboard.press('Control+KeyB');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+Alt+Digit1');
  await page.keyboard.type('Título');
  // Limpar o texto pode deixar o título de abertura no primeiro bloco: o novo é o último.
  await expect(editor(page).locator('h1').last()).toHaveText('Título');
});

test('Anotações: o texto sobrevive à troca de tela', async ({ page }) => {
  await page.keyboard.press('Alt+Digit2');
  await editor(page).fill('guardado');
  await page.keyboard.press('Alt+Digit1');
  await page.keyboard.press('Alt+Digit2');
  await expect(editor(page)).toHaveText('guardado');
});

test('Acervo: a busca acha sem acento, e Enter vai aos resultados', async ({ page }) => {
  await page.keyboard.press('Alt+Digit3');
  await page.keyboard.press('Alt+KeyF');
  await expect(bloco(page)).toHaveText('acervo.busca');
  await page.keyboard.type('atencao');
  await expect(page.locator('[data-block="acervo.resultados"]')).toContainText('Atenção Primária');
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('acervo.resultados');
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('acervo.pastas');
});

test('Acervo: Alt N cria matéria, pasta e aula', async ({ page }) => {
  const pergunta = page.getByTestId('pergunta');
  await page.keyboard.press('Alt+Digit3');
  await expect(bloco(page)).toHaveText('acervo.materias');
  await page.keyboard.press('Alt+KeyN');
  await expect(pergunta).toBeVisible();
  await page.keyboard.type('Saúde Coletiva');
  await page.keyboard.press('Enter');
  await expect(pergunta).toBeHidden();
  const card = page.getByRole('button', { name: /Saúde Coletiva/ });
  await expect(card).toBeVisible();
  await card.click();
  await expect(bloco(page)).toHaveText('acervo.pastas');

  await page.keyboard.press('Alt+KeyN');
  await page.keyboard.type('Módulo extra');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-block="acervo.pastas"]')).toContainText('Módulo extra');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Alt+KeyN');
  await page.keyboard.type('Aula nova');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-block="acervo.aulas"]')).toContainText('Aula nova');
});

test('Acervo: Alt C alterna entre aulas e cartões', async ({ page }) => {
  await page.keyboard.press('Alt+Digit3');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Alt+KeyC');
  await expect(page.locator('[data-block="acervo.aulas"]')).toContainText('Qual receptor');
  await page.keyboard.press('Alt+KeyC');
  await expect(page.locator('[data-block="acervo.aulas"]')).toContainText('Sistema complemento');
});

test('a Paleta abre matéria e aula pelo nome', async ({ page }) => {
  const primeiro = page.getByTestId('paleta').getByRole('menuitem').first();
  await page.keyboard.press('Alt+KeyP');
  await expect(page.getByTestId('paleta')).toBeVisible();
  await page.keyboard.type('Farmacocin');
  await expect(primeiro).toContainText('Farmacocin');
  await page.keyboard.press('Enter');
  await expect(tela(page)).toHaveText('mesa');
  await expect(page.locator('nav h1')).toHaveText('Farmacocinética');
  await page.keyboard.press('Alt+KeyP');
  const campo = page.getByTestId('paleta').getByRole('searchbox');
  await expect(campo).toBeFocused();
  await expect(campo).toHaveValue('');
  await page.keyboard.type('Imunologia');
  await expect(primeiro).toContainText('Imunologia');
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('acervo.pastas');
});

test('Anotações: o histórico restaura a versão anterior', async ({ page }) => {
  await page.keyboard.press('Alt+Digit2');
  await expect(editor(page)).toContainText('TLR4');
  await editor(page).fill('apagado sem querer');
  await page.keyboard.press('Alt+KeyO');
  await page.getByRole('menuitem', { name: 'Histórico de versões' }).click();
  await expect(page.getByTestId('historico')).toBeVisible();
  await expect(page.getByTestId('historico').getByRole('menuitem').first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('historico')).toBeHidden();
  await expect(editor(page)).toContainText('TLR4');
});

test('Agenda: a Grade mostra o horário e Alt N oferece os itens', async ({ page }) => {
  await page.keyboard.press('Alt+Digit5');
  await page.keyboard.press('Alt+KeyK');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-block="agenda.grade"]')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(bloco(page)).toHaveText('agenda.grade');
  await page.keyboard.press('Alt+KeyN');
  await expect(page.getByRole('menuitem', { name: 'Nova prova' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('pergunta')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('pergunta')).toBeHidden();
});

test('Agenda: prova nova aparece no Hub', async ({ page }) => {
  await page.keyboard.press('Alt+Digit5');
  await expect(bloco(page)).toHaveText('agenda.semana');
  await page.keyboard.press('Alt+KeyN');
  await page.getByRole('menuitem', { name: 'Nova prova' }).click();
  await page.getByTestId('pergunta').getByLabel('Matéria').selectOption({ label: 'Bioética' });
  await page.getByRole('button', { name: /Criar/ }).click();
  await expect(page.getByTestId('pergunta')).toBeHidden();
  await page.keyboard.press('Alt+Digit1');
  await expect(page.locator('[data-block="hub.provas"]')).toContainText('BIO');
});

test('Agenda: Exportar .ics baixa o arquivo', async ({ page }) => {
  await page.keyboard.press('Alt+Digit5');
  await expect(bloco(page)).toHaveText('agenda.semana');
  await page.keyboard.press('Alt+KeyN');
  const download = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: 'Exportar .ics' }).click();
  expect((await download).suggestedFilename()).toBe('ohara-agenda.ics');
});
