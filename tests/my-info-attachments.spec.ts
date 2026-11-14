import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '../fixtures/test';

const fileName = 'test_image.png';
const filePath = path.join(__dirname, '../utils/assets', fileName);

test('uploads, downloads, and deletes an attachment', async ({ myInfoPage }) => {
  const comment = `comment${Date.now().toString(36)}`;

  await myInfoPage.openFromMenu();
  await expect(myInfoPage.page).toHaveURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+$/);
  
  await myInfoPage.addButton.click();
  await expect(myInfoPage.fileInput).toBeAttached();
  await expect(myInfoPage.commentInput).toBeVisible();
  await expect(myInfoPage.saveButton).toBeVisible();

  await myInfoPage.uploadFileAndComment(filePath, comment);

  const row = myInfoPage.row({ fileName, comment });
  await expect(async () => {
    await myInfoPage.section.scrollIntoViewIfNeeded({ timeout: 1_000 });
    await row.scrollIntoViewIfNeeded({ timeout: 1_000 });
    await expect(row).toBeInViewport({ timeout: 1_000 });
  }).toPass();

  const download = await myInfoPage.downloadFile({ fileName, comment });
  expect(download.suggestedFilename()).toBe(fileName);

  const actualPath = await download.path();
  expect(actualPath, 'download was not saved').toBeTruthy();

  const [actual, expected] = await Promise.all([
    fs.readFile(actualPath!),
    fs.readFile(filePath),
  ]);
  expect(actual.equals(expected), 'downloaded bytes differ from test_image.png').toBe(true);

  await myInfoPage.deleteAttachment({ fileName, comment });
  await expect(myInfoPage.row({ fileName, comment })).toHaveCount(0);
});
