import { credentialsForAdmin } from '../config/env';
import { routes } from '../utils/routes';
import { test } from '../fixtures';
import { expect } from '@playwright/test';

test('Login page loaded and shows the login form', async ({page, loginPage }) => {
  await loginPage.open();

  await expect(page).toHaveURL(new RegExp(`${routes.login}$`));
  await expect(loginPage.usernameInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await expect(loginPage.submitButton).toBeVisible();
  await expect(loginPage.forgotPassword).toBeVisible();
});

test('Empty login form vields validation, shows error messages', async ({ loginPage }) => {
  await loginPage.open();

  await loginPage.submitButton.click();
  await expect(loginPage.fieldError('username')).toHaveText('Required');
  await expect(loginPage.fieldError('password')).toHaveText('Required');
});

test('Reject invalid credentials', async ({ loginPage }) => {
  await loginPage.open();
  
  await loginPage.login('not-a-user', 'wrong-password');
  await expect(loginPage.alertLabel).toContainText('Invalid credentials');
  await expect(loginPage.page).toHaveURL(new RegExp(`${routes.login}$`));
});

test('Reject disabled admin account', async ({ loginPage, disabledAdmin }) => {
  await loginPage.open();

  await loginPage.login(disabledAdmin.username, disabledAdmin.password);
  await expect(loginPage.alertLabel).toContainText('Account disabled');
  await expect(loginPage.page).toHaveURL(new RegExp(`${routes.login}$`));
});

test('Reject disabled ess account', async ({ loginPage, disabledEss }) => {
  await loginPage.open();

  await loginPage.login(disabledEss.username, disabledEss.password);
  await expect(loginPage.alertLabel).toContainText('Account disabled');
  await expect(loginPage.page).toHaveURL(new RegExp(`${routes.login}$`));
});

// Env ESS account is wiped on the hourly DB reset.
test(`Admin signs in and lands on the dashboard`, async ({ loginPage }) => {
  const { username, password } = credentialsForAdmin();

  await loginPage.open();
  await loginPage.login(username, password);

  await expect(loginPage.page).toHaveURL(new RegExp(`${routes.dashboard}$`));
});

test('Ess user signs in and lands on the dashboard', async ({ loginPage, createdUser }) => {
  await loginPage.open();
  await loginPage.login(createdUser.username, createdUser.password);

  await expect(loginPage.page).toHaveURL(new RegExp(`${routes.dashboard}$`));
});
