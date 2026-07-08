import { Page, Locator, expect } from '@playwright/test';

/**
 * DIA 23 - Page Object Model (POM)
 * LoginPage encapsula TODA a interacao com a tela de login.
 * O teste nao conhece seletores; conhece apenas acoes de negocio (login, etc).
 *
 * DIA 22 - Locators: usamos locators semanticos/data-test em vez de XPath fragil.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // SauceDemo expoe atributos data-test -> locators estaveis e legiveis.
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /** Navega ate a pagina de login (usa baseURL do config). */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /** Acao de negocio: preenche credenciais e submete. */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Valida que uma mensagem de erro foi exibida. */
  async expectError(text: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(text);
  }
}
