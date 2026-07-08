import { test, expect } from '@playwright/test';

/**
 * DIA 22 - Locators e Estrategias
 * Objetivo: escolher locators resilientes e entender o auto-waiting.
 * Exercicio: reescrever 3 locators ruins (XPath complexo) para
 * locators semanticos recomendados pelo Playwright.
 *
 * REGRA: prefira getByRole > getByLabel/getByPlaceholder > getByTestId.
 * Evite XPath posicional e classes CSS que mudam com o layout.
 */
test.describe('Dia 22 - De XPath fragil para locators semanticos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('3 locators ruins reescritos como semanticos', async ({ page }) => {
    // ------------------------------------------------------------------
    // RUIM 1:  //div[@class='login_wrapper']//input[@id='user-name']
    //   Fragil: depende da estrutura de divs e de classes de layout.
    // BOM:
    const username = page.getByPlaceholder('Username');

    // ------------------------------------------------------------------
    // RUIM 2:  //form/div[2]/input
    //   Fragil: posicional. Se inverter/adicionar campo, quebra.
    // BOM:
    const password = page.getByPlaceholder('Password');

    // ------------------------------------------------------------------
    // RUIM 3:  //input[@class='submit-button btn_action']
    //   Fragil: acopla ao CSS. Botao nao tem papel semantico no seletor.
    // BOM (role = como o usuario/leitor de tela enxerga):
    const loginBtn = page.getByRole('button', { name: 'Login' });

    // Auto-waiting: nao precisamos de sleep/waitForSelector; o Playwright
    // espera o elemento ficar acionavel antes de agir.
    await username.fill('standard_user');
    await password.fill('secret_sauce');
    await loginBtn.click();

    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('demonstra auto-waiting sem waits manuais', async ({ page }) => {
    // Sem waitForTimeout: o expect faz retry automatico ate o timeout.
    await page.getByPlaceholder('Username').fill('locked_out_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('[data-test="error"]')).toContainText(
      'locked out'
    );
  });
});
