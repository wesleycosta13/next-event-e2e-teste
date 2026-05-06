import { test, expect } from '../../fixtures/testBase';
import { gerarDadosUsuario } from '../../utils/dataFactory';

test.describe('Cadastro de Usuário', () => {

  test.beforeEach(async ({ registerPage }) => {
    await registerPage.navigate();
  });

  // 🔥 EMAIL

  test('Email inválido', async ({ registerPage }) => {
    const user = gerarDadosUsuario();
    user.email = 'email-invalido';

    await registerPage.fillForm(user);
    await registerPage.submit();

    const validationMessage = await registerPage.getEmailValidationMessage();
    expect(validationMessage).toMatch(/@|email/i);
  });

  test('Email vazio', async ({ registerPage }) => {
    const user = gerarDadosUsuario();
    user.email = '';

    await registerPage.fillForm(user);
    await registerPage.submit();

    const validationMessage = await registerPage.getEmailValidationMessage();
    expect(validationMessage).toMatch(/obrigat|preencha|fill out/i);
  });

  test('Email duplicado @regression', async ({ registerPage, testData, page }) => {
    const user = gerarDadosUsuario();
    testData.emailCriado = user.email; // Grava para exclusão no teardown

    // Primeiro cadastro
    await registerPage.fillForm(user);
    await registerPage.submit();
    await registerPage.waitForSuccessOrError();

    // Tenta cadastrar novamente com o mesmo email
    const outroUser = gerarDadosUsuario();
    outroUser.email = user.email;

    await registerPage.navigate();
    await registerPage.fillForm(outroUser);
    await registerPage.submit();

    const erro = await registerPage.getErrorMessage(/usuário já existe|email já está em uso/i);
    await expect(erro).toBeVisible();
  });

  // 🔥 MATRÍCULA

  test('Matrícula duplicada', async ({ registerPage, testData }) => {
    const user = gerarDadosUsuario();
    testData.emailCriado = user.email;

    await registerPage.fillForm(user);
    await registerPage.submit();
    await registerPage.waitForSuccessOrError();

    const outroUser = gerarDadosUsuario();
    outroUser.matricula = user.matricula;

    await registerPage.navigate();
    await registerPage.fillForm(outroUser);
    await registerPage.submit();

    const erro = await registerPage.getErrorMessage(/usuário já existe|matrícula já|já cadastrad/i);
    await expect(erro).toBeVisible();
  });

  // 🔥 CPF

  test('CPF duplicado', async ({ registerPage, testData }) => {
    const user = gerarDadosUsuario();
    testData.emailCriado = user.email;

    await registerPage.fillForm(user);
    await registerPage.submit();
    await registerPage.waitForSuccessOrError();

    const outroUser = gerarDadosUsuario();
    outroUser.cpf = user.cpf;

    await registerPage.navigate();
    await registerPage.fillForm(outroUser);
    await registerPage.submit();

    const erro = await registerPage.getErrorMessage(/usuário já existe|cpf já|já cadastrad/i);
    await expect(erro).toBeVisible();
  });

  // 🔥 SENHA

  test('Senha fraca', async ({ registerPage }) => {
    const user = gerarDadosUsuario();

    await registerPage.fillForm(user, { senha: '123' });
    await registerPage.submit();

    const erro = await registerPage.getErrorMessage(/A senha deve conter pelo menos 6 caractere/i);
    await expect(erro).toBeVisible();
  });

  // 🔥 ANO

  test('Ano de ingresso vazio', async ({ registerPage }) => {
    const user = gerarDadosUsuario();

    await registerPage.fillForm(user, { ano: '' });
    await registerPage.submit();

    const validationMessage = await registerPage.getAnoValidationMessage();
    expect(validationMessage).toMatch(/obrigat|preencha|fill out/i);
  });

  test('Deve exibir erro ao informar menos de 4 dígitos', async ({ registerPage }) => {
    const user = gerarDadosUsuario();

    await registerPage.fillForm(user, { ano: '123' });
    await registerPage.submit();

    const erro = await registerPage.getErrorMessage(/4 dígitos/i);
    await expect(erro).toBeVisible();
  });

  test('Deve exibir erro para ano inválido', async ({ registerPage }) => {
    const user = gerarDadosUsuario();

    await registerPage.fillForm(user, { ano: '3000' });
    await registerPage.submit();

    const erro = await registerPage.getErrorMessage(/inválido/i);
    await expect(erro).toBeVisible();
  });

  // 🔥 FLUXO FELIZ

  test('Cadastro com sucesso @smoke', async ({ registerPage, testData, page }) => {
    const user = gerarDadosUsuario();
    testData.emailCriado = user.email;

    await registerPage.fillForm(user);
    await registerPage.submit();
    await registerPage.goToLogin();

    await expect(page).toHaveURL('http://localhost:4000/');
  });

});