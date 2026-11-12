import { credentialsFor, roles } from '../src/config/env';
import { routes } from '../src/routes';
import { expect, test } from '../fixtures/test';

test('shows the login form', async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.expectForm();
});

test('requires username and password', async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.submit.click();
  await loginPage.expectRequiredFields();
});

test('rejects invalid credentials', async ({ loginPage }) => {
  await loginPage.open();
  await loginPage.login('not-a-user', 'wrong-password');
  await loginPage.expectInvalidCredentials();
  await expect(loginPage.page).toHaveURL(new RegExp(`${routes.login}$`));
});

for (const role of roles) {
  test(`${role} signs in and lands on the dashboard`, async ({ loginPage }) => {
    const { username, password } = credentialsFor(role);

    await loginPage.open();
    await loginPage.login(username, password);

    await expect(loginPage.page).toHaveURL(new RegExp(`${routes.dashboard}$`));
  });
}
