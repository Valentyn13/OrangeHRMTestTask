import { credentialsFor } from '../config/env';
import { roles } from '../utils/types';
import { routes } from '../utils/routes';
import { expect, test } from '../fixtures/test';

test('shows the login form', async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.expectForm();
});

test('requires username and password', async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.submitButton.click();
  await loginPage.expectRequiredFields();
});

test('rejects invalid credentials', async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.login('not-a-user', 'wrong-password');
  await loginPage.expectInvalidCredentials();
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
