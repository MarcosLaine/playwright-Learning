import { test, expect } from '@playwright/test';

/**
 * DIA 21 - Setup Playwright BASE
 * Objetivo: instalar, configurar e escrever o primeiro teste E2E.
 * Exercicio: fazer login e validar o redirecionamento.
 *
 * NOTA: aqui os seletores estao "crus", direto no teste. No DIA 23
 * refatoramos isso para Page Object Model (ver day23-pom.spec.ts).
 */
test.describe('Dia 21 - Login E2E (versao base)', () => {
  test('login valido redireciona para o inventario', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    // Validacao do redirecionamento pos-login
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
  });

  test('login invalido exibe mensagem de erro', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('senha_errada');
    await page.getByRole('button', { name: 'Login' }).click();

    // Nao deve redirecionar; deve mostrar erro
    await expect(page).not.toHaveURL(/.*inventory\.html/);
    await expect(page.locator('[data-test="error"]')).toContainText(
      'Username and password do not match'
    );
  });
});
