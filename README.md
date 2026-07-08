# Fase 2 · Semana 5 · Dias 21–25 — Automação Web com Playwright

Portfólio da **Semana 5** do QA Insider Planner (90 dias). Cinco dias construindo
uma suíte E2E profissional com Playwright + TypeScript, do setup ao CI/CD.

Site de prática: [SauceDemo](https://www.saucedemo.com) · usuário `standard_user` / senha `secret_sauce`.

> 📖 **Explicação dia a dia, detalhada (conceito + porquê de cada decisão):** veja o [GUIA_DETALHADO.md](GUIA_DETALHADO.md).

## Como rodar

```bash
# 0. Instalar Node.js 20+ (https://nodejs.org) — pré-requisito do Dia 21
cd playwright-fase2
npm install
npx playwright install       # baixa os navegadores

npm test                     # roda tudo (headless)
npm run test:headed          # roda com o navegador visível (Dia 25)
npm run test:ui              # modo UI interativo
npm run report               # abre o último HTML report (Dia 25)
```

## O que cada dia entrega

### Dia 21 — Setup Playwright BASE
- Arquivo: [`tests/day21-login.spec.ts`](tests/day21-login.spec.ts)
- Primeiro teste E2E: login válido + validação do **redirecionamento** para `/inventory.html`, e caminho de erro com credenciais inválidas.

### Dia 22 — Locators e Estratégias
- Arquivo: [`tests/day22-locators.spec.ts`](tests/day22-locators.spec.ts)
- 3 locators frágeis (XPath posicional/por classe) reescritos como **semânticos**:
  - `//div[@class='login_wrapper']//input[@id='user-name']` → `getByPlaceholder('Username')`
  - `//form/div[2]/input` → `getByPlaceholder('Password')`
  - `//input[@class='submit-button btn_action']` → `getByRole('button', { name: 'Login' })`
- Demonstra **auto-waiting** (sem `waitForTimeout`).

### Dia 23 — Page Object Model (POM)
- Pages: [`pages/LoginPage.ts`](pages/LoginPage.ts), [`pages/DashboardPage.ts`](pages/DashboardPage.ts)
- Teste: [`tests/day23-pom.spec.ts`](tests/day23-pom.spec.ts) — o teste do Dia 21 refatorado. Seletores saem do teste e vão para as pages; o teste passa a ler como intenção de negócio.

### Dia 24 — Fixtures e Hooks
- Setup: [`tests/auth.setup.ts`](tests/auth.setup.ts) autentica **uma vez** e salva `.auth/user.json` (storageState).
- Testes: [`tests/day24-authenticated.spec.ts`](tests/day24-authenticated.spec.ts) começam **já logados** — zero login repetido.
- Custom fixture: [`fixtures/pages.fixture.ts`](fixtures/pages.fixture.ts) injeta as page objects prontas.
- Orquestração no [`playwright.config.ts`](playwright.config.ts): project `setup` → `authenticated` via `dependencies`.

### Dia 25 — Reports e CI
- HTML reporter + `list` configurados no [`playwright.config.ts`](playwright.config.ts).
- CI: [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) roda a suíte a cada push/PR e publica o HTML report como artifact.
- `trace`/`screenshot`/`video` on-failure para debug.

## Respostas de entrevista (as perguntas do planner)

**Dia 21 — Por que Playwright em vez de Selenium?**
Auto-waiting nativo (menos flakiness), execução multi-browser real (Chromium/Firefox/WebKit) com uma API, trace viewer e paralelismo out-of-the-box, além de ser mais rápido por controlar o browser via protocolo de devtools em vez de WebDriver.

**Dia 22 — Como evitar flakiness por locators frágeis?**
Priorizar locators voltados ao usuário (`getByRole`, `getByLabel`, `getByText`) e `data-testid` estáveis; evitar XPath posicional e classes de layout. Combinar com o auto-waiting do Playwright em vez de `sleep`, e usar web-first assertions que fazem retry.

**Dia 23 — Por que usar POM? Desvantagens de não usar?**
POM centraliza seletores e ações numa camada; quando a UI muda, você ajusta em um lugar só. Sem POM, seletores ficam duplicados pelos testes → manutenção cara e testes ilegíveis. Desvantagem do POM: pode virar over-engineering se abstrair demais cedo.

**Dia 24 — Como gerenciar estado de auth entre testes sem login repetido?**
Autenticar uma vez num projeto de setup e persistir cookies/localStorage via `storageState`; os demais testes carregam esse estado e já iniciam logados. Isola por papel (um storageState por perfil) e reduz drasticamente o tempo de suíte.

**Dia 25 — Como integrar Playwright no pipeline? O que acontece quando falha?**
Workflow no GitHub Actions instala deps + navegadores e roda `playwright test` headless. Em falha: retries no CI, trace/screenshot/vídeo são coletados e o HTML report é publicado como artifact para investigação; o job retorna exit code ≠ 0 e bloqueia o merge.
