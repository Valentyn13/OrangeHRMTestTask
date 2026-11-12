import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '../src/routes';

export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly forgotPassword: Locator;
  readonly alert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByRole('textbox', { name: 'Username' });
    this.password = page.getByRole('textbox', { name: 'Password' });
    this.submit = page.getByRole('button', { name: 'Login' });
    this.forgotPassword = page.getByText('Forgot your password?');
    this.alert = page.getByRole('alert');
  }

  async open(): Promise<void> {
    await this.page.goto(routes.login);
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }

  fieldError(field: 'username' | 'password'): Locator {
    return this.page.locator(
      `.oxd-input-group:has(input[name="${field}"]) .oxd-input-field-error-message`,
    );
  }

  async expectForm(): Promise<void> {
    await expect(this.username).toBeVisible();
    await expect(this.password).toBeVisible();
    await expect(this.submit).toBeVisible();
    await expect(this.forgotPassword).toBeVisible();
  }

  async expectRequiredFields(): Promise<void> {
    await expect(this.fieldError('username')).toHaveText('Required');
    await expect(this.fieldError('password')).toHaveText('Required');
  }

  async expectInvalidCredentials(): Promise<void> {
    await expect(this.alert).toContainText('Invalid credentials');
  }
}
