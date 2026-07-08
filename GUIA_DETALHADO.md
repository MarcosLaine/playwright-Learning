# Guia Detalhado — Dias 21 a 25 (Automação Web com Playwright)

Explicação dia a dia do que foi feito: o **conceito**, **o que o arquivo faz** e o
**porquê de cada decisão**. Material de estudo da Semana 5 do QA Insider Planner.

## Como tudo se conecta

```
Dia 21: primeiro teste  ──┐
Dia 22: locators bons  ───┤──►  Dia 23: organiza em POM  ──►  Dia 24: reutiliza estado  ──►  Dia 25: roda no CI + reporta
                          (cada dia refina o anterior)
```

É uma progressão: você escreve, melhora os seletores, organiza em classes, otimiza a
performance e por fim automatiza a execução. É a evolução "do executor ao estrategista".

---

## Dia 21 — Setup Playwright BASE

**Conceito:** o "hello world" da automação web. Ter o Playwright instalado e escrever o
primeiro teste end-to-end (E2E) — que simula um usuário real abrindo o navegador,
digitando e clicando.

**Arquivo:** `tests/day21-login.spec.ts`

Como funciona um teste Playwright:

```ts
test('login valido redireciona para o inventario', async ({ page }) => {
  await page.goto('/');                                             // abre o site
  await page.getByPlaceholder('Username').fill('standard_user');    // digita
  await page.getByRole('button', { name: 'Login' }).click();        // clica
  await expect(page).toHaveURL(/.*inventory\.html/);                // valida
});
```

Pontos-chave:

- **`async / await`** — automação web é assíncrona (o navegador leva tempo pra
  responder), então toda ação é "aguardada".
- **`{ page }`** — fixture built-in do Playwright: uma aba limpa de navegador entregue
  pronta pra cada teste.
- **`expect(page).toHaveURL(...)`** — a validação do **redirecionamento**, coração do
  exercício. Depois do login, o SauceDemo manda o usuário para `/inventory.html`. Se
  não redirecionar, o teste falha.
- Foram feitos **dois testes**: o caminho feliz (login válido) e o caminho de erro
  (senha errada mostra mensagem). Um bom QA nunca testa só o happy path.

Detalhe intencional: aqui os seletores estão "crus", direto no teste — de propósito.
No Dia 23 mostramos por que isso é ruim ao refatorar.

---

## Dia 22 — Locators e Estratégias

**Conceito:** *Locator* é como o teste encontra um elemento na tela. A causa nº1 de
testes "flaky" (que falham sem motivo) são locators frágeis. O exercício pede pra pegar
3 locators ruins (XPath complexo) e reescrevê-los de forma resiliente.

**Arquivo:** `tests/day22-locators.spec.ts`

As 3 reescritas:

| Ruim (XPath frágil) | Bom (semântico) | Por quê |
|---|---|---|
| `//div[@class='login_wrapper']//input[@id='user-name']` | `getByPlaceholder('Username')` | Não depende da estrutura de `<div>`s nem de classes de layout |
| `//form/div[2]/input` | `getByPlaceholder('Password')` | XPath **posicional** — se alguém adicionar um campo antes, quebra |
| `//input[@class='submit-button btn_action']` | `getByRole('button', { name: 'Login' })` | Não acopla ao CSS; usa o *papel* do elemento |

**Hierarquia de prioridade** que todo QA deve decorar:

```
getByRole  >  getByLabel / getByPlaceholder  >  getByTestId  >  CSS  >  XPath
```

Quanto mais perto de "como o usuário/leitor de tela enxerga o elemento", mais estável.

**Auto-waiting** — o segundo teste do arquivo demonstra que você **não precisa de
`sleep`/`waitForTimeout`**. O Playwright espera automaticamente o elemento aparecer,
ficar visível e clicável antes de agir, e o `expect` re-tenta sozinho até dar certo (ou
estourar o timeout). Isso mata a maior fonte de flakiness.

---

## Dia 23 — Page Object Model (POM)

**Conceito:** POM é um padrão de projeto onde cada tela vira uma **classe**. Os
seletores e ações moram na classe, não espalhados pelos testes. Quando a UI muda, você
conserta em **um lugar só**.

**Arquivos:**

- `pages/LoginPage.ts` — a tela de login
- `pages/DashboardPage.ts` — a tela pós-login
- `tests/day23-pom.spec.ts` — o teste do Dia 21 **refatorado**

Anatomia de um Page Object:

```ts
export class LoginPage {
  readonly usernameInput: Locator;   // 1. os elementos como propriedades

  constructor(page: Page) {
    this.usernameInput = page.getByPlaceholder('Username');  // 2. definidos 1x
  }

  async login(username: string, password: string) {          // 3. ações de negócio
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

**Compare os dois testes** (o mesmo cenário):

Dia 21 (sem POM):

```ts
await page.getByPlaceholder('Username').fill('standard_user');
await page.getByPlaceholder('Password').fill('secret_sauce');
await page.getByRole('button', { name: 'Login' }).click();
```

Dia 23 (com POM):

```ts
await loginPage.login('standard_user', 'secret_sauce');
```

O teste passa a ler como **intenção de negócio** ("faça login"), não como uma sequência
de cliques. Se o botão de login mudar de nome, você conserta só o `LoginPage.ts` — e
**todos** os testes que usam login continuam funcionando.

O `DashboardPage` tem o método `expectLoaded()` que encapsula a validação de redirect —
reaproveitável em qualquer teste que precise confirmar que chegou no dashboard.

---

## Dia 24 — Fixtures e Hooks

**Conceito:** fazer login em **todo** teste é lento e desperdício. Fixtures permitem
preparar o estado **uma vez** e reutilizar. O exercício pede uma fixture de autenticação
que loga uma vez e compartilha o estado.

Foi usada a abordagem recomendada oficialmente pelo Playwright: **`storageState`**.

**Fluxo em 3 peças:**

1. **`tests/auth.setup.ts`** — um "teste de setup" que loga e salva os cookies +
   localStorage num arquivo:

   ```ts
   await loginPage.login('standard_user', 'secret_sauce');
   await page.context().storageState({ path: '.auth/user.json' });  // salva o estado
   ```

2. **`playwright.config.ts`** — orquestra a ordem. O project `authenticated` depende do
   `setup` e carrega o estado salvo:

   ```ts
   {
     name: 'authenticated',
     use: { storageState: '.auth/user.json' },  // já inicia logado
     dependencies: ['setup'],                     // roda o setup antes
   }
   ```

3. **`tests/day24-authenticated.spec.ts`** — nenhum teste faz login. Eles vão direto pra
   área logada:

   ```ts
   await page.goto('/inventory.html');  // já está autenticado!
   ```

O ganho: se você tem 50 testes autenticados, o login acontece **1 vez**, não 50. Suíte
muito mais rápida.

**Bônus — custom fixtures:** em `fixtures/pages.fixture.ts` é mostrado o outro sentido de
"fixture": injetar as page objects já prontas nos testes, eliminando o
`new LoginPage(page)` repetido. Isso ensina o mecanismo `test.extend()`, base de tudo no
Playwright.

---

## Dia 25 — Reports e CI

**Conceito:** automação só gera valor se roda **automaticamente** e produz **relatórios
legíveis**. Este dia conecta os testes a um pipeline.

**Reports** — no `playwright.config.ts`:

```ts
reporter: [
  ['list'],                        // saída no terminal em tempo real
  ['html', { open: 'never' }],     // relatório navegável em HTML
],
use: {
  trace: 'on-first-retry',         // grava a "linha do tempo" da falha
  screenshot: 'only-on-failure',   // print no momento do erro
  video: 'retain-on-failure',      // vídeo do teste que falhou
}
```

Rodar `npm run report` abre o HTML com cada passo, timings e artefatos de debug.
`--headed` roda com o navegador visível; sem a flag, roda headless (invisível, mais
rápido — padrão em CI).

**CI** — `.github/workflows/playwright.yml`:

```yaml
on: [push, pull_request]   # dispara a cada push/PR
steps:
  - npm ci                              # instala deps
  - npx playwright install --with-deps  # instala navegadores
  - npx playwright test                 # roda headless
  - upload-artifact (playwright-report) # publica o relatório
```

Detalhes profissionais incluídos:

- **`retries: 2` só no CI** — reduz falhas por instabilidade de rede sem esconder bugs
  locais.
- **`if: ${{ !cancelled() }}`** no upload — publica o relatório **mesmo se os testes
  falharem** (é justamente quando você mais precisa dele).
- **"O que acontece quando falha?"** (pergunta de entrevista): o job retorna exit code
  ≠ 0, bloqueia o merge do PR, e trace/screenshot/vídeo ficam disponíveis como artifact
  pra investigar.
