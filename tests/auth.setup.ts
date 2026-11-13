import { expect, test as setup } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { authStatePath, credentialsFor, ensureAuthDir } from '../config/env';
import { roles } from '../utils/types';
import { routes } from '../utils/routes';

ensureAuthDir();

for (const role of roles.filter((role) => role !== 'ess')) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const { username, password } = credentialsFor(role);
    console.log('username', username);
    console.log('password', password);
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(username, password);

    await expect(page).toHaveURL(new RegExp(`${routes.dashboard}$`));
    await page.context().storageState({ path: authStatePath(role) });
  });
}
