import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '../utils/routes';

function readUsername(body: string | null): string | undefined {
  if (!body) return;
  try {
    const username = JSON.parse(body).username;
    return typeof username === 'string' ? username : undefined;
  } catch {
    return;
  }
}

export class EditUserPage {
  readonly form: Locator;
  readonly userRole: Locator;
  readonly employeeName: Locator;
  readonly status: Locator;
  readonly username: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.form = page.locator('form.oxd-form');
    this.userRole = this.field('User Role').locator('.oxd-select-text');
    this.employeeName = this.field('Employee Name').getByPlaceholder('Type for hints...');
    this.status = this.field('Status').locator('.oxd-select-text');
    this.username = this.field('Username').locator('input');
    this.saveButton = this.form.getByRole('button', { name: 'Save' });
  }

  async update(changes: { username: string }): Promise<void> {

    // Wait for form data loading to complete, and the loader to be hidden
    // I will wait only for username, no need to check other fields
    await expect(this.username).not.toHaveValue('');
    await expect(this.page.locator('.oxd-form-loader')).toHaveCount(0);

    // Create a listener for the username validation request
    const validationListener = this.page.waitForResponse((res) => {
      if (res.request().method() !== 'GET') return false;
      const url = new URL(res.url());
      return (
        url.pathname.endsWith('/api/v2/admin/validation/user-name') &&
        url.searchParams.get('userName') === changes.username
      );
    });

    // Create a listener for the PUT request
    const savedListener = this.page.waitForResponse((res) => {
      const req = res.request();
      return (
        res.ok() &&
        req.method() === 'PUT' &&
        /\/api\/v2\/admin\/users\/\d+$/.test(new URL(res.url()).pathname) &&
        readUsername(req.postData()) === changes.username
      );
    });

    // Fill the username input
    await this.username.fill(changes.username);

    // Validate the username validation request
    const validationResponse = await validationListener;
    expect(validationResponse.ok()).toBe(true);


    // Click the save button
    await this.saveButton.click();

    // Validate the PUT request
    const savedResponse = await savedListener;
    expect(savedResponse.ok()).toBe(true);
    expect(readUsername(savedResponse.request().postData())).toBe(changes.username);
  }

  private field(label: string): Locator {
    return this.form.locator('.oxd-input-group').filter({
      has: this.page.locator('label', { hasText: new RegExp(`^${label}$`) }),
    });
  }
}
