import { expect, type Locator, type Page } from '@playwright/test';
import type { NewEmployee } from '../../utils/types';

export class AddEmployeeForm {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeId: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.employeeId = page.locator('.oxd-input-group').filter({
      has: page.locator('label', { hasText: /^Employee Id$/ }),
    }).locator('input');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async create(employee: NewEmployee): Promise<void> {
    await this.firstNameInput.fill(employee.firstName);
    await this.lastNameInput.fill(employee.lastName);
    await expect(this.employeeId).not.toHaveValue('');
    await this.employeeId.fill(employee.employeeId);
    await this.saveButton.click();
    await this.page.waitForURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+$/);
  }
}
