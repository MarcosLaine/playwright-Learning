import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * DIA 23 - Page Object Model (POM) APLICADO
 * Objetivo: separar a logica de teste da logica de pagina.
 * Exercicio: criar POM para LoginPage/DashboardPage e refatorar o dia 21.
 *
 * Compare com day21-login.spec.ts: aqui o teste le como intencao de
 * negocio, sem seletores espalhados. Manutencao fica centralizada nas pages.
 */
test.describe('Dia 23 - Login refatorado com POM', () => {
  test('login valido redireciona para o dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    await dashboard.expectLoaded();
  });

  test('login invalido mantem na tela e mostra erro', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'senha_errada');

    await loginPage.expectError('Username and password do not match');
  });
});
