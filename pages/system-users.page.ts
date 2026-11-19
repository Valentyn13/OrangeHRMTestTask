import { type Locator, type Page } from '@playwright/test';
import { routes } from '../utils/routes';
import { SystemUsersSearchForm } from './components/system-users-search-form';
import { SystemUsersTable } from './components/system-users-table';

export class SystemUsersPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly addUserButton: Locator;
  readonly search: SystemUsersSearchForm;
  readonly users: SystemUsersTable;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'System Users' });
    this.addUserButton = page.locator('.orangehrm-header-container').getByRole('button', { name: 'Add' });
    this.search = new SystemUsersSearchForm(page);
    this.users = new SystemUsersTable(page);
    this.confirmDeleteButton = page.getByRole('button', { name: 'Yes, Delete' });
  }

  async searchByUsername(username: string): Promise<void> {
    await this.search.fillUsername(username);
    await this.search.searchButton.click();
  }

  async open(): Promise<void> {
    await this.page.goto(routes.systemUsers);
  }
}
