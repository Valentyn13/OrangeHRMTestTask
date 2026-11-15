import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from '../fixtures';
import { expect } from '@playwright/test';

const fileName = 'test_image.png';
const filePath = path.join(__dirname, '../utils/assets', fileName);

test('Attachments operations [Create, Download, Verify, Delete]', async ({ myInfoPage }) => {
  const comment = `comment${Date.now().toString(36)}`;
  const attachment = { fileName, comment };

  await test.step('Open My Info', async () => {
    await myInfoPage.openFromMenu();
    await expect(myInfoPage.page).toHaveURL(/\/pim\/viewPersonalDetails\/empNumber\/\d+$/);
  });

  await test.step('Open the add attachment form', async () => {
    await myInfoPage.addButton.click();
    await expect(myInfoPage.fileInput).toBeAttached();
    await expect(myInfoPage.commentInput).toBeVisible();
    await expect(myInfoPage.saveButton).toBeVisible();
  });

  await test.step('Upload the attachment and verify it is visible', async () => {
    await myInfoPage.uploadFileAndComment(filePath, comment);

    const row = myInfoPage.row(attachment);
    await expect(async () => {
      await myInfoPage.section.scrollIntoViewIfNeeded({ timeout: 1_000 });
      await row.scrollIntoViewIfNeeded({ timeout: 1_000 });
      await expect(row).toBeInViewport({ timeout: 1_000 });
    }).toPass();
  });

  await test.step('Download and verify the attachment is the same as the uploaded one', async () => {
    const download = await myInfoPage.downloadFile(attachment);
    expect(download.suggestedFilename()).toBe(fileName);

    const actualPath = await download.path();
    expect(actualPath, 'Download was not saved').toBeTruthy();

    const [actual, expected] = await Promise.all([
      fs.readFile(actualPath!),
      fs.readFile(filePath),
    ]);
    expect(actual.equals(expected), 'Downloaded bytes differ from expected').toBe(true);
  });

  await test.step('Delete the attachment', async () => {
    await myInfoPage.deleteAttachment(attachment);
    await expect(myInfoPage.row(attachment)).toHaveCount(0);
  });
});
