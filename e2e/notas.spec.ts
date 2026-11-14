import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const tela = (page: Page) => page.getByTestId('tela');
const janela = (page: Page) => page.getByTestId('pergunta');
const PIN = '482193';
const PIN2 = '135790';

async function criarMateria(page: Page, name: string) {
  await page.keyboard.press('Alt+Digit3');
  await page.keyboard.press('Alt+KeyN');
  await page.keyboard.type(name);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: new RegExp(name) })).toBeVisible();
  await page.waitForTimeout(500);
}

async function abrirNotas(page: Page) {
  await page.getByRole('button', { name: 'Mais', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Notas', exact: true }).click();
}

async function preencher(page: Page, valores: string[]) {
  const campos = janela(page).locator('input, textarea, select');
  for (const [indice, valor] of valores.entries()) {
    const campo = campos.nth(indice);
    if ((await campo.evaluate((el) => el.tagName)) === 'SELECT') await campo.selectOption(valor);
    else await campo.fill(valor);
  }
}

async function digitar(page: Page, indice: number, pin: string) {
  await janela(page).locator('input').nth(indice).focus();
  await page.keyboard.type(pin);
}

async function guardarCodigo(page: Page): Promise<string> {
  const codigo = page.getByTestId('codigo-recuperacao');
  await expect(codigo).toHaveText(/^[A-Z2-7]{4}(-[A-Z2-7]{4}){4}$/, { timeout: 20000 });
  const texto = (await codigo.textContent()) ?? '';
  await page.getByRole('button', { name: /Anotei o código/ }).click();
  return texto;
}

test('Notas: PIN, código, itens, trava, 5 erros, recuperar e aparelho novo', async ({
  page,
  browser,
}) => {
  await page.goto('./');
  await expect(tela(page)).toHaveText('hub');
  await criarMateria(page, 'Cardiologia');
  await abrirNotas(page);

  // O PIN é digitado na própria tela, sem janela.
  await expect(page.getByText('Crie um PIN de 6 números')).toBeVisible();
  await page.keyboard.type(PIN);
  await expect(page.getByText('Repita o PIN')).toBeVisible();
  await page.keyboard.type(PIN);
  const codigo = await guardarCodigo(page);
  await expect(page.getByRole('heading', { name: 'Boletim geral' })).toBeVisible({
    timeout: 20000,
  });

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: /Avaliações do 1º bim/ })).toBeVisible();
  await page.keyboard.press('Alt+KeyN');
  await preencher(page, ['Prova segredo azul', '1', '10', '8', '0', 'nenhum']);
  await page.keyboard.press('Enter');
  await expect(page.getByText('Prova segredo azul')).toBeVisible();
  await page.keyboard.press('Alt+KeyN');
  await preencher(page, ['Prova pendente', '1', '10', '-', '0', 'nenhum']);
  await page.keyboard.press('Enter');
  await expect(page.getByText('Prova pendente')).toBeVisible();
  await expect(page.getByText('4.0').first()).toBeVisible();

  // Aparelho novo: o outro aparelho mostra o código; este lê (sem câmera) e cria o PIN dele.
  await page.keyboard.press('Alt+KeyO');
  await page.getByRole('menuitem', { name: 'Adicionar outro aparelho' }).click();
  await digitar(page, 0, PIN);
  const aparelho = page.getByTestId('codigo-aparelho');
  await expect(aparelho).toHaveText(/^OHARA1:/, { timeout: 20000 });
  const textoAparelho = (await aparelho.textContent()) ?? '';
  expect(textoAparelho).not.toContain(codigo);
  await expect(page.getByRole('img', { name: /QR/ })).toBeVisible();
  await page.keyboard.press('Escape');

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

  // PIN certo abre.
  await expect(page.getByText('Digite o PIN de 6 números')).toBeVisible();
  await page.keyboard.type(PIN);
  await expect(page.getByRole('heading', { name: 'Boletim geral' })).toBeVisible({
    timeout: 20000,
  });
  await expect(janela(page)).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('Prova segredo azul')).toBeVisible();

  // Trava e erra 5 vezes: o PIN e a chave guardada são apagados.
  await page.keyboard.press('Alt+KeyO');
  await page.getByRole('menuitem', { name: 'Travar as Notas agora' }).click();
  await expect(page.getByText('As notas estão travadas')).toBeVisible();
  for (let erro = 0; erro < 5; erro += 1) {
    await expect(page.getByText('Digite o PIN de 6 números')).toBeVisible();
    await page.keyboard.type('000000');
    await page.waitForTimeout(1800);
  }
  await expect(page.getByText('Digite o PIN de 6 números')).toHaveCount(0);

  // Recupera pelo código e cria PIN novo.
  await page.getByRole('button', { name: 'Criar PIN novo com o código' }).click();
  await preencher(page, [codigo.toLowerCase()]);
  await digitar(page, 1, PIN2);
  await page.keyboard.type(PIN2);
  await page.keyboard.press('Enter');
  const codigoNovo = await guardarCodigo(page);
  expect(codigoNovo).not.toBe(codigo);
  await expect(page.getByRole('heading', { name: 'Boletim geral' })).toBeVisible({
    timeout: 20000,
  });
  await expect(janela(page)).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('Prova segredo azul')).toBeVisible();

  // Segundo aparelho (outro navegador limpo): pelo código do aparelho e PIN próprio.
  const outro = await (await browser.newContext()).newPage();
  await outro.goto('./');
  await expect(tela(outro)).toHaveText('hub');
  await abrirNotas(outro);
  await outro.getByRole('button', { name: 'Já uso em outro aparelho' }).click();
  await janela(outro).locator('textarea').fill(textoAparelho);
  await digitar(outro, 0, PIN);
  await outro.keyboard.type(PIN);
  await outro.keyboard.press('Enter');
  await expect(outro.getByRole('heading', { name: 'Boletim geral' })).toBeVisible({
    timeout: 20000,
  });
});
