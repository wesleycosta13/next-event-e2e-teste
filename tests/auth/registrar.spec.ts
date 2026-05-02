import { test, expect, Page } from '@playwright/test';

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

  return {
    nome,
    matricula: `${timestamp.toString().slice(-8)}`,
    email: `${nome.toLowerCase().normalize('NFD')
      .replace(/[^\w\s]/g, '')
      .replace(/ /g, '')}${numerosEmail}@gmail.com`,
    cpf: `${Math.floor(10000000000 + Math.random() * 89999999999)}`
  };
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
    await expect.stringMatching(/preencha|obrigat|please fill/i)
  });

  test('Email duplicado', async ({ page }) => {
    const user = gerarDadosUnicos();

    await preencherFormulario(page, user);
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    const outroUser = gerarDadosUnicos();
    outroUser.email = user.email;

    await page.goto(BASE_URL);
    await preencherFormulario(page, outroUser);
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.getByText(/usuário já existe/i)).toBeVisible();
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
  const anoInput = page.getByRole('textbox', { name: 'Ano de ingresso' });

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    const isInvalid = await anoInput.evaluate(el => !(el as HTMLInputElement).checkValidity());
  expect(isInvalid).toBe(false);
  });

  test('Campo CPF em branco', async ({ page }) => {
    const user = gerarDadosUnicos();

    await preencherFormulario(page, user);
    const cpfInput = page.getByRole('textbox', { name: 'CPF' });
    await cpfInput.fill('');

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    const isInvalid = await cpfInput.evaluate(el => !(el as HTMLInputElement).checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('Campo CPF inválido', async ({ page }) => {
    const user = gerarDadosUnicos();

    await preencherFormulario(page, user);
    const cpfInput = page.getByRole('textbox', { name: 'CPF' });
    await cpfInput.fill('12345'); // Menos dígitos que o esperado

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.getByText(/deve conter 11 dígitos/i)).toBeVisible();
  });

 test('Deve exibir erro ao não selecionar o semestre', async ({ page }) => {
  const user = gerarDadosUnicos();

  await preencherFormulario(page, user);

  const semestreSelect = page.locator('#semestre');

  // Garante que nenhum valor válido foi selecionado
  await semestreSelect.selectOption(''); // ou não faz nada se já vier vazio

  await page.getByRole('button', { name: 'Cadastrar' }).click();

  // Validação HTML5
  const isInvalid = await semestreSelect.evaluate(
    el => !(el as HTMLSelectElement).checkValidity()
  );

  expect(isInvalid).toBe(true);
});

  test('Deve exibir erro ao deixar Ano de ingresso vazio', async ({ page }) => {
  const user = gerarDadosUnicos();

  await preencherFormulario(page, user);

  const anoInput = page.getByRole('textbox', { name: 'Ano de ingresso' });

  await anoInput.fill('');

  await page.getByRole('button', { name: 'Cadastrar' }).click();

  // Validação HTML5 (mais confiável)
  const isInvalid = await anoInput.evaluate(
    el => !(el as HTMLInputElement).checkValidity()
  );

  expect(isInvalid).toBe(true);
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