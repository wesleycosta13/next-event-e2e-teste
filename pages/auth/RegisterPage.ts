import { Page, Locator, expect } from '@playwright/test';
import { UserData } from '../../utils/dataFactory';

export class RegisterPage {
  readonly page: Page;
  readonly nomeInput: Locator;
  readonly matriculaInput: Locator;
  readonly emailInput: Locator;
  readonly cpfInput: Locator;
  readonly anoInput: Locator;
  readonly semestreSelect: Locator;
  readonly cursoSelect: Locator;
  readonly senhaInput: Locator;
  readonly confirmarSenhaInput: Locator;
  readonly cadastrarButton: Locator;
  readonly irParaLoginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nomeInput = page.getByRole('textbox', { name: 'Nome Completo' });
    this.matriculaInput = page.getByRole('textbox', { name: 'Matrícula' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.cpfInput = page.getByRole('textbox', { name: 'CPF' });
    this.anoInput = page.getByRole('textbox', { name: 'Ano de ingresso' });
    this.semestreSelect = page.locator('#semestre');
    this.cursoSelect = page.locator('#curso');
    this.senhaInput = page.getByRole('textbox', { name: 'Senha', exact: true });
    this.confirmarSenhaInput = page.getByRole('textbox', { name: 'Confirmar sua senha' });
    this.cadastrarButton = page.getByRole('button', { name: 'Cadastrar' });
    this.irParaLoginButton = page.getByRole('button', { name: 'Ir para o Login' });
  }

  async navigate() {
    await this.page.goto('/cadastro');
  }

  async fillForm(user: UserData, options?: { senha?: string, ano?: string }) {
    await this.nomeInput.fill(user.nome);
    await this.matriculaInput.fill(user.matricula);
    await this.emailInput.fill(user.email);
    await this.cpfInput.fill(user.cpf);
    
    await this.anoInput.fill(options?.ano ?? '2023');
    await this.semestreSelect.selectOption('1');
    await this.cursoSelect.selectOption('Ciência da Computação');
    
    const senha = options?.senha ?? 'SenhaForte123';
    await this.senhaInput.fill(senha);
    await this.confirmarSenhaInput.fill(senha);
  }

  async submit() {
    await this.cadastrarButton.click();
  }

  async waitForSuccessOrError() {
    // Aguarda que o botão Ir para Login apareça (indicando sucesso do fluxo frontend/HTTP)
    // Isso evita que a navegação feche antes da request do backend terminar.
    await expect(this.irParaLoginButton).toBeVisible();
  }

  async goToLogin() {
    await this.irParaLoginButton.click();
  }

  async getEmailValidationMessage(): Promise<string> {
    return await this.emailInput.evaluate(el => (el as HTMLInputElement).validationMessage);
  }

  async getAnoValidationMessage(): Promise<string> {
    return await this.anoInput.evaluate(el => (el as HTMLInputElement).validationMessage);
  }

  async getErrorMessage(regex: RegExp) {
    return this.page.getByText(regex);
  }
}
