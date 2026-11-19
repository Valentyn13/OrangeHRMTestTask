import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '../utils/routes';
import type { NewSystemUser } from '../utils/types';

export class AddUserPage {
  readonly form: Locator;
  readonly userRole: Locator;
  readonly employeeNameInput: Locator;
  readonly status: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.form = page.locator('form.oxd-form');
    this.userRole = this.field('User Role').locator('.oxd-select-text');
    this.employeeNameInput = this.field('Employee Name').getByPlaceholder('Type for hints...');
    this.status = this.field('Status').locator('.oxd-select-text');
    this.usernameInput = this.field('Username').locator('input');
    this.passwordInput = this.field('Password').locator('input');
    this.confirmPasswordInput = this.field('Confirm Password').locator('input');
    this.saveButton = this.form.getByRole('button', { name: 'Save' });
  }

  async create(user: NewSystemUser): Promise<void> {
    await this.select(this.userRole, user.userRole);
    await this.selectEmployee(user.employeeName);
    await this.select(this.status, user.status);
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
    await this.saveButton.click();
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

    await this.employeeNameInput.fill(employeeName);
    await this.page
      .locator('.oxd-autocomplete-option')
      .filter({ hasNotText: 'Searching' })
      .getByText(pattern)
      .click();
  }
}
