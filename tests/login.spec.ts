import { credentialsFor } from '../config/env';
import { roles } from '../utils/types';
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

test('rejects invalid credentials', async ({ loginPage }) => {
  await loginPage.open();
  
  await loginPage.login('not-a-user', 'wrong-password');
  await expect(loginPage.alertLabel).toContainText('Invalid credentials');
  await expect(loginPage.page).toHaveURL(new RegExp(`${routes.login}$`));
});

// ESS user disabled because DB resets every hour
for (const role of roles.filter((role) => role !== 'ess')) {
  test(`${role} signs in and lands on the dashboard`, async ({ loginPage }) => {
    const { username, password } = credentialsFor(role);

    await loginPage.open();
    await loginPage.login(username, password);

    await expect(loginPage.page).toHaveURL(new RegExp(`${routes.dashboard}$`));
  });
}
