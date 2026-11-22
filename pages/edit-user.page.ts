import { expect, type Locator, type Page } from '@playwright/test';
import { urls } from '../utils/routes';
import { assertOk, readUsername } from '../utils/helpers';
import type { SystemUser } from '../utils/types';

export class EditUserPage {
  readonly userRoleInput: Locator;
  readonly employeeNameInput: Locator;
  readonly statusInput: Locator;
  readonly usernameInput: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.userRoleInput = this.field('User Role').locator('.oxd-select-text');
    this.employeeNameInput = this.field('Employee Name').getByPlaceholder('Type for hints...');
    this.statusInput = this.field('Status').locator('.oxd-select-text');
    this.usernameInput = this.field('Username').locator('input');
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
  }

  async updateUserDetails(changes: SystemUser): Promise<void> {
    // Wait for form data loading to complete, and the loader to be hidden.
    // Username is enough; the other fields load with it.
    await expect(this.usernameInput).not.toHaveValue('');
    await expect(this.page.locator('.oxd-form-loader')).toHaveCount(0);

    await this.select(this.userRoleInput, changes.userRole);
    await this.selectEmployee(changes.employeeName);
    await this.select(this.statusInput, changes.status);

    const validationListener = this.page.waitForResponse((res) => {
      if (res.request().method() !== 'GET') return false;
      const url = new URL(res.url());
      return (
        url.pathname.endsWith(urls.userNameValidation) &&
        url.searchParams.get('userName') === changes.username
      );
    });

    const savedListener = this.page.waitForResponse((res) => {
      const req = res.request();
      return (
        req.method() === 'PUT' &&
        /\/api\/v2\/admin\/users\/\d+$/.test(new URL(res.url()).pathname) &&
        readUsername(req.postData()) === changes.username
      );
    });

    await this.usernameInput.fill(changes.username);
    await assertOk(await validationListener, 'updateUserDetails validation');

    await this.saveButton.click();
    await assertOk(await savedListener, 'updateUserDetails');
  }

  private field(label: string): Locator {
    return this.page.locator('.oxd-input-group').filter({
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
