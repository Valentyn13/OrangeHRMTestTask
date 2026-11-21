import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from '../fixtures';
import { expect } from '@playwright/test';
import { urls } from '../utils/routes';

const fileName = 'test_image.png';
const filePath = path.join(__dirname, '../utils/assets', fileName);

test('Creates, downloads, and deletes an attachment', async ({ myInfoPage, createdEmployee }) => {
  const comment = `comment${Date.now().toString(36)}`;
  const attachment = { fileName, comment };

  await myInfoPage.openEmployee(createdEmployee.empNumber);
  await expect(myInfoPage.page).toHaveURL(urls.employeeDetails(createdEmployee.empNumber));

  try {
    await myInfoPage.addButton.click();
    await expect(myInfoPage.fileInput).toBeAttached();
    await expect(myInfoPage.commentInput).toBeVisible();
    await expect(myInfoPage.saveButton).toBeVisible();

    await myInfoPage.uploadFileAndComment(filePath, comment);
    const row = myInfoPage.row(attachment);
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeVisible();

    const download = await myInfoPage.downloadFile(attachment);
    expect(download.suggestedFilename()).toBe(fileName);

    const actualPath = await download.path();
    expect(actualPath, 'Download was not saved').toBeTruthy();

    const [actual, expected] = await Promise.all([
      fs.readFile(actualPath!),
      fs.readFile(filePath),
    ]);
    expect(actual.equals(expected), 'Downloaded bytes differ from expected').toBe(true);
  } finally {
    if (await myInfoPage.row(attachment).count()) {
      await myInfoPage.deleteAttachment(attachment);
    }
  }

  await expect(myInfoPage.row(attachment)).toHaveCount(0);
});
