import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const AUTH_FILE = '.auth/user.json';

/**
 * DIA 24 - Fixtures e Hooks (setup de autenticacao)
 * Objetivo: autenticar UMA vez e reutilizar o estado nos demais testes.
 *
 * Este "setup project" roda antes dos testes autenticados (ver
 * playwright.config.ts -> dependencies: ['setup']). Ele salva cookies e
 * localStorage em .auth/user.json. Os testes 'authenticated' carregam esse
 * estado via storageState e ja iniciam logados -> zero login repetido.
 */
setup('autentica e salva o storageState', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');

  // Garante que o login funcionou antes de persistir o estado.
  await expect(page).toHaveURL(/.*inventory\.html/);

  await page.context().storageState({ path: AUTH_FILE });
});
