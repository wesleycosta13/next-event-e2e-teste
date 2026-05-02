import { test, expect, Page } from '@playwright/test';
import { Pool } from 'pg';

const pool = new Pool({
  // Tente pegar a URL da variável de ambiente, se não usa a padrão do postgresql local
  connectionString: process.env.DATABASE_URL
});

const emailsCriados: string[] = [];

// 🔹 Base URL (evita repetição)
const BASE_URL = 'http://localhost:4000/cadastro';
const LOGIN_URL = 'http://localhost:4000';

// 🔹 Gerador de dados
function gerarDadosUnicos() {
  const nomes = [
    'Ana Silva','Carlos Souza','Mariana Oliveira','João Pereira',
    'Fernanda Costa','Lucas Almeida','Patrícia Santos','Rafael Lima',
    'Juliana Rocha','Bruno Martins','Luana Fernandes','Gustavo Ribeiro',
    'Camila Dias','Felipe Carvalho',
  ];

  const timestamp = Date.now();
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const numerosEmail = Math.floor(1000 + Math.random() * 9000);

  const user = {
    nome,
    matricula: `${timestamp.toString().slice(-8)}`,
    email: `${nome.toLowerCase().normalize('NFD')
      .replace(/[^\w\s]/g, '')
      .replace(/ /g, '')}${numerosEmail}@gmail.com`,
    cpf: `${Math.floor(10000000000 + Math.random() * 89999999999)}`
  };
  
  emailsCriados.push(user.email);
  return user;
}

// 🔹 Preenche formulário completo
async function preencherFormulario(page: Page, user: { nome: string, matricula: string, email: string, cpf: string }) {
  await page.getByRole('textbox', { name: 'Nome Completo' }).fill(user.nome);
  await page.getByRole('textbox', { name: 'Matrícula' }).fill(user.matricula);
  await page.getByRole('textbox', { name: 'Email' }).fill(user.email);
  await page.getByRole('textbox', { name: 'CPF' }).fill(user.cpf);
  await page.getByRole('textbox', { name: 'Ano de ingresso' }).fill('2023');
  await page.locator('#semestre').selectOption('1');
  await page.locator('#curso').selectOption('Ciência da Computação');
  await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('SenhaForte123');
  await page.getByRole('textbox', { name: 'Confirmar sua senha' }).fill('SenhaForte123');
}

// 🔹 Setup padrão
test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
});

// 🔹 Cleanup: Apaga os usuários criados ao final de CADA teste
test.afterEach(async () => {
  while (emailsCriados.length > 0) {
    const email = emailsCriados.pop();
    if (email) {
      try {
        await pool.query('DELETE FROM "usuario" WHERE email = $1', [email]);
      } catch (err) {
        console.error(`Erro ao deletar usuário ${email}:`, err);
      }
    }
  }
});

test.describe('Cadastro de Usuário', () => {

  // 🔥 EMAIL

  test('Email inválido', async ({ page }) => {
    const user = gerarDadosUnicos();
    user.email = 'email-invalido';

    await preencherFormulario(page, user);
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    const validationMessage = await page.getByRole('textbox', { name: 'Email' }).evaluate(el => (el as HTMLInputElement).validationMessage);
    await expect(validationMessage).toMatch(/@/);
  });

  test('Email vazio', async ({ page }) => {
    const user = gerarDadosUnicos();
    user.email = '';

    await preencherFormulario(page, user);
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    const validationMessage = await page.getByRole('textbox', { name: 'Email' }).evaluate(el => (el as HTMLInputElement).validationMessage);
    await expect(validationMessage).toMatch(/obrigat|preencha|please fill/i);
  });

  test('Email duplicado', async ({ page }) => {
    const user = gerarDadosUnicos();

    await preencherFormulario(page, user);
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    // 🔹 Aguardar a conclusão do primeiro cadastro antes de sair da página
    // Senão o Playwright cancela a requisição HTTP e o usuário não é salvo no banco
    await expect(page.getByRole('button', { name: 'Ir para o Login' })).toBeVisible();

    const outroUser = gerarDadosUnicos();
    outroUser.email = user.email;

    await page.goto(BASE_URL);
    await preencherFormulario(page, outroUser);
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.getByText(/usuário já existe|email já está em uso/i)).toBeVisible();
  });

  // 🔥 SENHA
  test('Senha fraca', async ({ page }) => {
    const user = gerarDadosUnicos();

    await preencherFormulario(page, user);
    await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('123');
    await page.getByRole('textbox', { name: 'Confirmar sua senha' }).fill('123');

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.getByText(/A senha deve conter pelo menos 6 caractere/i)).toBeVisible();
  });

  // 🔥 ANO

  test('Ano de ingresso vazio', async ({ page }) => {
    const user = gerarDadosUnicos();

    await preencherFormulario(page, user);
    await page.getByRole('textbox', { name: 'Ano de ingresso' }).fill('');

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    const validationMessage = await page.getByRole('textbox', { name: 'Ano de ingresso' }).evaluate(el => (el as HTMLInputElement).validationMessage);
    await expect(validationMessage).toMatch(/obrigat|preencha|please fill/i);
  });

  test('Deve exibir erro ao informar menos de 4 dígitos', async ({ page }) => {
  const user = gerarDadosUnicos();

  await preencherFormulario(page, user);

  const anoInput = page.getByRole('textbox', { name: 'Ano de ingresso' });

  await anoInput.fill('123'); // 3 dígitos

  await page.getByRole('button', { name: 'Cadastrar' }).click();

  await expect(
    page.getByText(/4 dígitos/i)
  ).toBeVisible();
});

test('Deve exibir erro para ano inválido', async ({ page }) => {
  const user = gerarDadosUnicos();

  await preencherFormulario(page, user);

  const anoInput = page.getByRole('textbox', { name: 'Ano de ingresso' });

  await anoInput.fill('3000'); // 4 dígitos, mas inválido

  await page.getByRole('button', { name: 'Cadastrar' }).click();

  await expect(
    page.getByText(/inválido/i)
  ).toBeVisible();
});

  // 🔥 FLUXO FELIZ

  test('Cadastro com sucesso', async ({ page }) => {
    const user = gerarDadosUnicos();

    await preencherFormulario(page, user);
    await page.getByRole('button', { name: 'Cadastrar' }).click();
    await page.getByRole('button', { name: 'Ir para o Login' }).click();
    await expect(page).toHaveURL(LOGIN_URL);
  });

});