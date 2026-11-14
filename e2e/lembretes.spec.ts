import { expect, test, type Page } from '@playwright/test';

const tela = (page: Page) => page.getByTestId('tela');
const item = (page: Page, texto: string) => page.getByRole('button', { name: new RegExp(`^${texto}`) });

async function novoLembrete(page: Page, texto: string) {
  await page.keyboard.press('Alt+KeyI');
  await page.keyboard.type(texto);
  await page.keyboard.press('Enter');
  await expect(item(page, texto)).toBeVisible();
}


test('Lembretes: feito vai para baixo; atrasado volta ao topo com pílula; feito de ontem some', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-11-13T12:00:00'));
  await page.goto('./');
  await expect(tela(page)).toHaveText('hub');

  await novoLembrete(page, 'Lembrete A');
  await novoLembrete(page, 'Lembrete B');
  await novoLembrete(page, 'Lembrete C');

  await item(page, 'Lembrete A').click();
  await expect(item(page, 'Lembrete A')).toHaveAccessibleName(/feito/);
  const linhas = page.getByRole('button', { name: /^Lembrete [ABC]/ });
  await expect(linhas.nth(2)).toHaveAccessibleName(/^Lembrete A/);
  await expect(linhas.nth(0)).not.toHaveAccessibleName(/feito/);
  await expect(linhas.nth(1)).not.toHaveAccessibleName(/feito/);
  await page.waitForTimeout(600); // grava no banco antes de recarregar

  await page.clock.setFixedTime(new Date('2026-11-15T12:00:00'));
  await page.reload();
  await expect(tela(page)).toHaveText('hub');

  await expect(item(page, 'Lembrete A')).toHaveCount(0);
  const atrasado = page.getByRole('button', { name: /^Lembrete B.*atrasado há 2 dias$/ });
  await expect(atrasado).toBeVisible();
  await expect(atrasado).toContainText('2 d');
  await expect(page.getByRole('button', { name: /^Lembrete [BC]/ }).first()).toHaveAccessibleName(
    /^Lembrete B/,
  );

  await atrasado.click();
  const linhas2 = page.getByRole('button', { name: /^Lembrete [BC]/ });
  await expect(linhas2.last()).toHaveAccessibleName(/^Lembrete B, feito/);
});

test('Dica: aparece com nome e atalho, desliza para o vizinho e fecha ao sair', async ({ page }) => {
  await page.goto('./?exemplo');
  await expect(page.getByTestId('bloco')).toHaveText('hub.agenda');
  await page.keyboard.press('Alt+Digit2');
  await expect(page.getByTestId('bloco')).toHaveText('mesa.notes');
  const barra = page.getByRole('toolbar', { name: 'Formatação' });
  await expect(barra).toBeVisible();

  await barra.getByRole('button', { name: 'Negrito' }).hover();
  const dica = page.getByRole('tooltip');
  await expect(dica).toContainText('Negrito');
  await expect(dica).toContainText('Ctrl B');

  await barra.getByRole('button', { name: 'Itálico' }).hover();
  await expect(dica).toHaveCount(1);
  await expect(dica).toContainText('Itálico');
  await expect(dica).toContainText('Ctrl I');

  await page.mouse.move(5, 400);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});
