import { expect, type Locator, type Page, type Response } from '@playwright/test';

async function assertOk(response: Response, label: string): Promise<void> {
  if (response.ok()) return;
  throw new Error(`${label} failed: ${response.status()} ${await response.text()}`);
}

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
  readonly usernameInput: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.form = page.locator('form.oxd-form');
    this.userRole = this.field('User Role').locator('.oxd-select-text');
    this.employeeName = this.field('Employee Name').getByPlaceholder('Type for hints...');
    this.status = this.field('Status').locator('.oxd-select-text');
    this.usernameInput = this.field('Username').locator('input');
    this.saveButton = this.form.getByRole('button', { name: 'Save' });
  }

  async updateUserDetails(changes: { username: string }): Promise<void> {
    // Wait for form data loading to complete, and the loader to be hidden.
    // Username is enough; the other fields load with it.
    await expect(this.usernameInput).not.toHaveValue('');
    await expect(this.page.locator('.oxd-form-loader')).toHaveCount(0);

    const validationListener = this.page.waitForResponse((res) => {
      if (res.request().method() !== 'GET') return false;
      const url = new URL(res.url());
      return (
        url.pathname.endsWith('/api/v2/admin/validation/user-name') &&
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
    return this.form.locator('.oxd-input-group').filter({
      has: this.page.locator('label', { hasText: new RegExp(`^${label}$`) }),
    });
  }
}
