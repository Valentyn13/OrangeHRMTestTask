import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '../utils/routes';

export class EmployeeListPage {
  readonly addButton: Locator;

  constructor(private readonly page: Page) {
    this.addButton = page.locator('.orangehrm-header-container').getByRole('button', { name: 'Add' });
  }

  async open(): Promise<void> {
    await this.page.goto(routes.employeeList);
    await expect(this.page).toHaveURL(new RegExp(`${routes.employeeList}$`));
    await expect(this.addButton).toBeVisible();
  }
}
