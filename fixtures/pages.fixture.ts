import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * DIA 24 - Fixtures e Hooks (custom fixtures)
 * Alem do storageState, o Playwright permite criar SUAS proprias fixtures.
 * Aqui injetamos LoginPage e DashboardPage prontos em cada teste,
 * eliminando o boilerplate "new LoginPage(page)" repetido.
 *
 * Uso:
 *   import { test, expect } from '../fixtures/pages.fixture';
 *   test('exemplo', async ({ loginPage, dashboardPage }) => { ... });
 */
type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    // setup: cria a page object
    await use(new LoginPage(page));
    // (teardown iria aqui, apos o use, se necessario)
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
