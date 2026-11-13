import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '../../utils/routes';
import type { NewSystemUser } from '../../utils/types';

export class AddUserForm {
  readonly form: Locator;
  readonly userRole: Locator;
  readonly employeeName: Locator;
  readonly status: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly save: Locator;

  constructor(private readonly page: Page) {
    this.form = page.locator('form.oxd-form');
    this.userRole = this.field('User Role').locator('.oxd-select-text');
    this.employeeName = this.field('Employee Name').getByPlaceholder('Type for hints...');
    this.status = this.field('Status').locator('.oxd-select-text');
    this.username = this.field('Username').locator('input');
    this.password = this.field('Password').locator('input');
    this.confirmPassword = this.field('Confirm Password').locator('input');
    this.save = this.form.getByRole('button', { name: 'Save' });
  }

  async expectReady(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${routes.saveSystemUser}$`));
    await expect(this.form).toBeVisible();
    await expect(this.userRole).toBeVisible();
    await expect(this.employeeName).toBeVisible();
    await expect(this.status).toBeVisible();
    await expect(this.username).toBeVisible();
    await expect(this.password).toBeVisible();
    await expect(this.confirmPassword).toBeVisible();
    await expect(this.save).toBeVisible();
  }

  async create(user: NewSystemUser): Promise<void> {
    await this.select(this.userRole, user.userRole);
    await this.selectEmployee(user.employeeName);
    await this.select(this.status, user.status);
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.confirmPassword.fill(user.password);
    await this.save.click();
    await this.page.waitForURL(new RegExp(`${routes.systemUsers}$`));
  }

  private field(label: string): Locator {
    return this.form.locator('.oxd-input-group').filter({
      has: this.page.locator('label', { hasText: new RegExp(`^${label}$`) }),
    });
  }

  private async select(dropdown: Locator, option: string): Promise<void> {
    await dropdown.click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }

  private async selectEmployee(employeeName: string): Promise<void> {
    const pattern = new RegExp(`^${employeeName.trim().split(/\s+/).join('\\s+')}$`);

    await this.employeeName.fill(employeeName);
    await this.page
      .locator('.oxd-autocomplete-option')
      .filter({ hasNotText: 'Searching' })
      .getByText(pattern)
      .click();
  }
}
