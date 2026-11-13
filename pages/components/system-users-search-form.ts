import { Locator, Page } from "@playwright/test";
import { UserRole, UserStatus } from '../../utils/types';

export class SystemUsersSearchForm {
    readonly form: Locator;
    readonly username: Locator;
    readonly userRole: Locator;
    readonly employeeName: Locator;
    readonly status: Locator;
    readonly search: Locator;
    readonly reset: Locator;
  
    constructor(private readonly page: Page) {
      this.form = page.locator('form.oxd-form');
      this.username = this.field('Username').locator('input');
      this.userRole = this.field('User Role').locator('.oxd-select-text');
      this.employeeName = this.field('Employee Name').getByPlaceholder('Type for hints...');
      this.status = this.field('Status').locator('.oxd-select-text');
      this.search = this.form.getByRole('button', { name: 'Search' });
      this.reset = this.form.getByRole('button', { name: 'Reset' });
    }
  
    async fillUsername(username: string): Promise<void> {
      await this.username.fill(username);
    }
  
    async selectUserRole(userRole: UserRole): Promise<void> {
      await this.select(this.userRole, userRole);
    }
  
    async selectEmployee(employeeName: string): Promise<void> {
      await this.employeeName.fill(employeeName);
      await this.page
        .locator('.oxd-autocomplete-option')
        .filter({ hasNotText: 'Searching' })
        .getByText(employeeName, { exact: true })
        .click();
    }
  
    async selectStatus(status: UserStatus): Promise<void> {
      await this.select(this.status, status);
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
  }