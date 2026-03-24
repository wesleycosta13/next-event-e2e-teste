import { test, expect } from '@playwright/test';

test.describe('Criação de Usuário', () => {
  test('Deve criar um novo usuário com dados válidos', async ({ page }) => {
    await page.goto('http://localhost:4000/cadastro');
    await page.fill('input[name="name"]', 'Usuário Teste');
    await page.fill('input[name="email"]', 'usuario.teste@example.com');
    await page.fill('input[name="password"]', 'SenhaForte123');
    await page.fill('input[name="confirmPassword"]', 'SenhaForte123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard|home|sucesso/i);
    await expect(page.locator('.success, .alert-success')).toContainText(/usuário criado|bem-vindo|sucesso/i);
  });

  test('Deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('http://localhost:4000/cadastro');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error, .alert-danger')).toContainText(/obrigatóri|preencha/i);
  });

  test('Deve validar email inválido', async ({ page }) => {
    await page.goto('http://localhost:4000/cadastro');
    await page.fill('input[name="name"]', 'Usuário Teste');
    await page.fill('input[name="email"]', 'email-invalido');
    await page.fill('input[name="password"]', 'SenhaForte123');
    await page.fill('input[name="confirmPassword"]', 'SenhaForte123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error, .alert-danger')).toContainText(/email inválido|email não é válido/i);
  });

  test('Deve validar senhas diferentes', async ({ page }) => {
    await page.goto('http://localhost:4000/cadastro');
    await page.fill('input[name="name"]', 'Usuário Teste');
    await page.fill('input[name="email"]', 'usuario.teste@example.com');
    await page.fill('input[name="password"]', 'SenhaForte123');
    await page.fill('input[name="confirmPassword"]', 'SenhaDiferente123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error, .alert-danger')).toContainText(/senhas não coincidem|senhas diferentes/i);
  });
});
