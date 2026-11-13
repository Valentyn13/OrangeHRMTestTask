import { expect, type Locator, type Page } from '@playwright/test';
import type { NewEmployee } from '../../utils/types';

export class AddEmployeeForm {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly employeeId: Locator;
  readonly save: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.employeeId = page.locator('.oxd-input-group').filter({
      has: page.locator('label', { hasText: /^Employee Id$/ }),
    }).locator('input');
    this.save = page.getByRole('button', { name: 'Save' });
  }

  async create(employee: NewEmployee): Promise<void> {
    await this.firstName.fill(employee.firstName);
    await this.lastName.fill(employee.lastName);
    await expect(this.employeeId).not.toHaveValue('');
    await this.employeeId.fill(employee.employeeId);
    await this.save.click();
    await this.page.waitForURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+$/);
  }
}
