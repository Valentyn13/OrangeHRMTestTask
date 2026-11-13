import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '../utils/routes';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPassword: Locator;
  readonly alertLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.getByRole('button', { name: 'Login' });
    this.forgotPassword = page.getByText('Forgot your password?');
    this.alertLabel = page.getByRole('alert');
  }

  async open(): Promise<void> {
    await this.page.goto(routes.login);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  fieldError(field: 'username' | 'password'): Locator {
    return this.page.locator(
      `.oxd-input-group:has(input[name="${field}"]) .oxd-input-field-error-message`,
    );
  }

  async expectForm(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.forgotPassword).toBeVisible();
  }

  async expectRequiredFields(): Promise<void> {
    await expect(this.fieldError('username')).toHaveText('Required');
    await expect(this.fieldError('password')).toHaveText('Required');
  }

  async expectInvalidCredentials(): Promise<void> {
    await expect(this.alertLabel).toContainText('Invalid credentials');
  }
}
