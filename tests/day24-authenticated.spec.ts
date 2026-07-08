import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * DIA 24 - Fixtures e Hooks APLICADO
 * Estes testes rodam no project 'authenticated', que carrega o
 * storageState salvo por auth.setup.ts. Repare: NENHUM teste faz login.
 * Vamos direto para a area logada -> setup reutilizado, testes mais rapidos.
 */
test.describe('Dia 24 - Testes reutilizando estado autenticado', () => {
  test('inicia ja logado no inventario', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await page.goto('/inventory.html');
    await dashboard.expectLoaded();
  });

  test('inventario lista os 6 produtos do SauceDemo', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await page.goto('/inventory.html');
    await dashboard.expectLoaded();

    expect(await dashboard.itemCount()).toBe(6);
  });

  test('carrinho comeca vazio para o usuario logado', async ({ page }) => {
    await page.goto('/cart.html');
    await expect(page.locator('[data-test="title"]')).toHaveText('Your Cart');
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);
  });
});
