# Next Event - E2E Tests 🎭

Este repositório contém a suíte de testes automatizados End-to-End (E2E) para o sistema **Next Event**. Os testes foram desenvolvidos utilizando o [Playwright](https://playwright.dev/) para garantir o correto funcionamento dos fluxos críticos da aplicação, como o cadastro e a autenticação de usuários.

## 📋 Pré-requisitos

Antes de executar os testes localmente, você precisará ter instalado:

- [Node.js](https://nodejs.org/en/) (versão LTS recomendada)
- [Docker](https://www.docker.com/) e Docker Compose (para subir a infraestrutura completa local ou no CI/CD)

## 🚀 Instalação

1. Clone o repositório e acesse a pasta do projeto:
   ```bash
   git clone <url-do-repositorio>
   cd next-event-e2e-tests
   ```

2. Instale as dependências do projeto:
   ```bash
   npm install
   ```

3. Instale os navegadores exigidos pelo Playwright:
   ```bash
   npx playwright install --with-deps
   ```

## 💻 Executando os Testes Localmente

Como a aplicação depende de backend e frontend para ser testada, certifique-se de que a aplicação está rodando (usualmente na porta `:4000` ou através do Docker Compose) antes de iniciar os testes.

### Rodar todos os testes (Headless)
Executa a suíte de testes em segundo plano no terminal:
```bash
npm run test
# ou
npx playwright test
```

### Rodar com Interface Gráfica (UI Mode)
Abre a interface interativa do Playwright, excelente para debugar testes falhos, inspecionar o DOM e rodar testes específicos:
```bash
npx playwright test --ui
```

### Rodar um cenário específico
```bash
npx playwright test -g "Nome do Cenário"
```

## 📂 Estrutura do Projeto

```text
next-event-e2e-tests/
├── .github/workflows/
│   └── playwright.yml       # Pipeline de CI/CD do GitHub Actions
├── tests/
│   └── auth/
│       └── registrar.spec.ts # Testes de Cadastro / Autenticação
├── playwright.config.ts     # Configurações gerais do Playwright
├── package.json             # Dependências e scripts do Node.js
└── README.md                # Documentação do repositório
```

## 🔄 Integração Contínua (CI/CD)

Este repositório está configurado com o **GitHub Actions** para rodar a bateria de testes automaticamente sempre que houver um `push` ou `pull_request` para as branches `main` e `master`.

O fluxo do CI (`playwright.yml`) realiza as seguintes etapas:
1. Faz o checkout do código.
2. Prepara o ambiente Node.js e instala dependências + navegadores do Playwright.
3. Sobem os containers da aplicação localmente (`docker compose up -d`).
4. Aguarda a aplicação ficar disponível (porta 4000) usando a ferramenta `wait-on`.
5. Executa os testes usando `npx playwright test`. A URL base pode ser parametrizada utilizando o gatilho de `workflow_dispatch` (disparo manual).
6. Faz upload do Relatório de Testes (HTML) como artefato, permitindo visualizá-lo e analisar falhas diretamente no painel do GitHub Actions.

## ✨ Boas Práticas Adotadas

- **Validações Nativas**: O projeto valida mensagens de erro diretamente da validação nativa HTML5 (`checkValidity()`), tornando os testes multilinguagem e multibrowser mais confiáveis.
- **Isolamento**: Dados como `email` e `cpf` gerados aleatoriamente durante o teste com a função `gerarDadosUnicos()` evitam conflitos de estado no banco de dados e garantem isolamento.
