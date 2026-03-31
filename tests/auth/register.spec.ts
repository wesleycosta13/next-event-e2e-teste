import { test, expect } from '@playwright/test';

test.describe('Create User', () => {

  function gerarDadosUnicos() {
    const nomes = [
      'Ana Silva',
      'Carlos Souza',
      'Mariana Oliveira',
      'João Pereira',
      'Fernanda Costa',
      'Lucas Almeida',
      'Patrícia Santos',
      'Rafael Lima',
      'Juliana Rocha',
      'Bruno Martins',
      'Luana Fernandes',
      'Gustavo Ribeiro',
      'Camila Dias',
      'Felipe Carvalho',
    ];
    const timestamp = Date.now();
    const nome = nomes[Math.floor(Math.random() * nomes.length)];
    const numerosEmail = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatórios
    return {
      nome: nome,
      matricula: `${timestamp.toString().slice(-8)}`,
      email: `${nome.toLowerCase().normalize('NFD').replace(/[^\w\s]/g, '').replace(/ /g, '')}${numerosEmail}@gmail.com`,
      cpf: `${Math.floor(10000000000 + Math.random() * 89999999999)}`
    };
  }

    // Testa se é possível criar um novo usuário com dados válidos
  test('Should create a new user with valid data', async ({ page }) => {
    const user = gerarDadosUnicos();

    await page.goto('http://localhost:4000/cadastro');

    await page.getByRole('textbox', { name: 'Nome Completo' }).fill(user.nome);
    await page.getByRole('textbox', { name: 'Matrícula' }).fill(user.matricula);
    await page.getByRole('textbox', { name: 'Email' }).fill(user.email);
    await page.getByRole('textbox', { name: 'CPF' }).fill(user.cpf);
    await page.getByRole('spinbutton', { name: 'Ano de ingresso' }).fill('2023');
    await page.locator('#semestre').selectOption('1');
    await page.locator('#curso').selectOption('Ciência da Computação');
    await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('SenhaForte123');
    await page.getByRole('textbox', { name: 'Confirmar sua senha' }).fill('SenhaForte123');

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page).toHaveURL('http://localhost:4000/');
  });

    // Testa a validação dos campos obrigatórios
  test('Should validate required fields', async ({ page }) => {
    await page.goto('http://localhost:5173/cadastro');
    await page.getByRole('button', { name: 'Cadastrar' }).click();
    await expect(page.locator('.error, .alert-danger')).toContainText(/obrigatóri|preencha/i);
  });

    // Testa a validação de email inválido
  test('Should validate invalid email', async ({ page }) => {
    const user = gerarDadosUnicos();

    await page.goto('http://localhost:5173/cadastro');

    await page.getByRole('textbox', { name: 'Nome Completo' }).fill(user.nome);
    await page.getByRole('textbox', { name: 'Matrícula' }).fill(user.matricula);
    await page.getByRole('textbox', { name: 'Email' }).fill('email-invalido');
    await page.getByRole('textbox', { name: 'CPF' }).fill(user.cpf);
    await page.getByRole('spinbutton', { name: 'Ano de ingresso' }).fill('2023');
    await page.locator('#semestre').selectOption('1');
    await page.locator('#curso').selectOption('Ciência da Computação');
    await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('SenhaForte123');
    await page.getByRole('textbox', { name: 'Confirmar sua senha' }).fill('SenhaForte123');

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.locator('.error, .alert-danger')).toContainText(/email inválido|email não é válido/i);
  });

    // Testa a validação quando as senhas são diferentes
  test('Should validate different passwords', async ({ page }) => {
    const user = gerarDadosUnicos();

    await page.goto('http://localhost:5173/cadastro');

    await page.getByRole('textbox', { name: 'Nome Completo' }).fill(user.nome);
    await page.getByRole('textbox', { name: 'Matrícula' }).fill(user.matricula);
    await page.getByRole('textbox', { name: 'Email' }).fill(user.email);
    await page.getByRole('textbox', { name: 'CPF' }).fill(user.cpf);
    await page.getByRole('spinbutton', { name: 'Ano de ingresso' }).fill('2023');
    await page.locator('#semestre').selectOption('1');
    await page.locator('#curso').selectOption('Ciência da Computação');
    await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('SenhaForte123');
    await page.getByRole('textbox', { name: 'Confirmar sua senha' }).fill('SenhaDiferente123');

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.locator('.error, .alert-danger')).toContainText(/senhas não coincidem|senhas diferentes/i);
  });

});