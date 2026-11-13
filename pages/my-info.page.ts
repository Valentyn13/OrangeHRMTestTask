import { expect, type Download, type Locator, type Page } from '@playwright/test';
import { routes } from '../utils/routes';

export type Attachment = {
  fileName: string;
  comment: string;
};

export class MyInfoPage {
  readonly page: Page;
  readonly section: Locator;
  readonly addButton: Locator;
  readonly table: Locator;
  readonly file: Locator;
  readonly comment: Locator;
  readonly saveButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.section = page.locator('.orangehrm-attachment');
    this.addButton = this.page.getByRole('button', { name: 'Add' });
    this.table = this.section.getByRole('table');
    this.file = this.section.locator('input[type="file"]');
    this.comment = this.section.getByPlaceholder('Type comment here');
    this.saveButton = this.section.getByRole('button', { name: 'Save' });
    this.confirmDeleteButton = page.getByRole('button', { name: 'Yes, Delete' });
  }

  row(attachment: Attachment): Locator {
    return this.table
      .getByRole('row')
      .filter({ hasText: attachment.fileName })
      .filter({ hasText: attachment.comment });
  }

  async openFromMenu(): Promise<void> {
    await this.page.goto(routes.dashboard);
    await this.page.locator(`a.oxd-main-menu-item[href="${routes.myInfo}"]`).click();
  }

  async uploadFileAndComment(filePath: string, comment: string): Promise<void> {
    await this.comment.scrollIntoViewIfNeeded();
    await this.file.setInputFiles(filePath);
    await this.comment.fill(comment);
    await this.saveButton.click();
  }

  async downloadFile(attachment: Attachment): Promise<Download> {
    const row = this.row(attachment);
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      row.locator('button:has(.bi-download)').click(),
    ]);
    return download;
  }

  async deleteAttachment(attachment: Attachment): Promise<void> {
    const row = this.row(attachment);
    await row.locator('button:has(.bi-trash)').click();
    await this.confirmDeleteButton.click();
  }
}
