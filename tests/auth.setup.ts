import { expect, test as setup } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { authStatePath, credentialsFor, ensureAuthDir, roles } from '../src/config/env';
import { routes } from '../src/routes';

ensureAuthDir();

for (const role of roles) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const { username, password } = credentialsFor(role);
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(username, password);

    await expect(page).toHaveURL(new RegExp(`${routes.dashboard}$`));
    await page.context().storageState({ path: authStatePath(role) });
  });
}
