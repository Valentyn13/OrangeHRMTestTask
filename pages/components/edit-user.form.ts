import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '../../utils/routes';

export class EditUserForm {
  readonly form: Locator;
  readonly userRole: Locator;
  readonly employeeName: Locator;
  readonly status: Locator;
  readonly username: Locator;
  readonly save: Locator;

  constructor(private readonly page: Page) {
    this.form = page.locator('form.oxd-form');
    this.userRole = this.field('User Role').locator('.oxd-select-text');
    this.employeeName = this.field('Employee Name').getByPlaceholder('Type for hints...');
    this.status = this.field('Status').locator('.oxd-select-text');
    this.username = this.field('Username').locator('input');
    this.save = this.form.getByRole('button', { name: 'Save' });
  }

  async expectReady(): Promise<void> {
    await expect(this.page).toHaveURL(/\/admin\/saveSystemUser\/\d+$/);
    await expect(this.form).toBeVisible();
    await expect(this.userRole).toBeVisible();
    await expect(this.employeeName).toBeVisible();
    await expect(this.status).toBeVisible();
    await expect(this.username).not.toHaveValue('');
    await expect(this.save).toBeVisible();
  }

  async update(changes: { username: string }): Promise<void> {
    await this.username.fill(changes.username);
    await this.save.click();
    await this.page.waitForURL(new RegExp(`${routes.systemUsers}$`));
  }

  private field(label: string): Locator {
    return this.form.locator('.oxd-input-group').filter({
      has: this.page.locator('label', { hasText: new RegExp(`^${label}$`) }),
    });
  }
}
