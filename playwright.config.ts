import { defineConfig, devices } from '@playwright/test';

/**
 * DIA 25 - Reports e CI com Playwright
 * Configuracao central do Playwright.
 * - HTML reporter para visualizar resultados
 * - list reporter no terminal
 * - baseURL para nao repetir a URL em cada teste
 * - trace/screenshot/video on-failure para debug
 */
export default defineConfig({
  testDir: './tests',

  // Roda testes em paralelo dentro de cada arquivo
  fullyParallel: true,

  // Falha o build no CI se alguem esqueceu um test.only
  forbidOnly: !!process.env.CI,

  // Retries apenas no CI (reduz flakiness em pipeline)
  retries: process.env.CI ? 2 : 0,

  // 1 worker no CI para resultados deterministicos
  workers: process.env.CI ? 1 : undefined,

  // DIA 25: reporters. HTML abre relatorio navegavel; list mostra no terminal.
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: 'https://www.saucedemo.com',

    // Coleta trace apenas quando um teste falha ao re-tentar (bom p/ debug)
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // DIA 24: projeto de setup que autentica UMA vez e salva o storageState.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // Testes que NAO dependem de login (dias 21, 22, 23 no fluxo de login).
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /authenticated\.spec\.ts/,
    },

    // DIA 24: testes que reaproveitam o estado autenticado salvo pelo setup.
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /authenticated\.spec\.ts/,
    },
  ],
});
