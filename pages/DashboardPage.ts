import { Page, Locator, expect } from '@playwright/test';

/**
 * DIA 23 - Page Object Model (POM)
 * DashboardPage representa a tela de inventario (pos-login) do SauceDemo.
 * Encapsula validacoes e acoes do dashboard.
 */
export class DashboardPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryItems: Locator;
  readonly cartLink: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
  }

  /** Valida que o redirecionamento pos-login chegou no inventario. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }

  /** Retorna a quantidade de produtos listados. */
  async itemCount(): Promise<number> {
    return this.inventoryItems.count();
  }
}
