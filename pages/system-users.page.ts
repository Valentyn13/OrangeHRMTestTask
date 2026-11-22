import { type Locator, type Page } from '@playwright/test';
import { routes, urls } from '../utils/routes';
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
    this.addUserButton = page.getByRole('button', { name: 'Add' });
    this.search = new SystemUsersSearchForm(page);
    this.users = new SystemUsersTable(page);
    this.confirmDeleteButton = page.getByRole('button', { name: 'Yes, Delete' });
  }

  async searchByUsername(username: string): Promise<void> {
    const listed = this.page.waitForResponse((response) => {
      if (response.request().method() !== 'GET' || !response.ok()) return false;
      const url = new URL(response.url());
      return url.pathname.includes(urls.adminUsers) && url.searchParams.get('username') === username;
    });
    await this.search.fillUsername(username);
    await this.search.searchButton.click();
    await listed;
  }

  async confirmDelete(): Promise<void> {
    const deleted = this.page.waitForResponse((response) =>
      response.request().method() === 'DELETE' &&
      response.url().includes(urls.adminUsers) &&
      response.ok(),
    );
    await this.confirmDeleteButton.click();
    await deleted;
  }

  async open(): Promise<void> {
    await this.page.goto(routes.systemUsers);
  }
}
