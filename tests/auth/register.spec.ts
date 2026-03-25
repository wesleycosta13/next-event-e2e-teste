import { test, expect } from '@playwright/test';

test.describe('Criação de Usuário', () => {

  function gerarDadosUnicos() {
    const timestamp = Date.now();
    return {
      nome: `Usuário Teste ${timestamp}`,
      matricula: `${timestamp.toString().slice(-8)}`,
      email: `usuario${timestamp}@email.com`,
      cpf: `${Math.floor(10000000000 + Math.random() * 89999999999)}`
    };
  }

  test('Deve criar um novo usuário com dados válidos', async ({ page }) => {
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
    await page.getByRole('textbox', { name: 'Confirmar sua senha' }).fill('SenhaForte123');

    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('Deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('http://localhost:5173/cadastro');
    await page.getByRole('button', { name: 'Cadastrar' }).click();
    await expect(page.locator('.error, .alert-danger')).toContainText(/obrigatóri|preencha/i);
  });

  test('Deve validar email inválido', async ({ page }) => {
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

  test('Deve validar senhas diferentes', async ({ page }) => {
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