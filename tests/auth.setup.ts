import { expect, test as setup } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { authStatePath, credentialsFor, ensureAuthDir, saveAuthCookie } from '../config/env';
import { roles } from '../utils/types';
import { routes } from '../utils/routes';

// ESS user disabled because DB resets every hour
for (const role of roles.filter((role) => role !== 'ess')) {
  setup(`Authenticate as ${role}`, async ({ page }) => {
    ensureAuthDir();
    const { username, password } = credentialsFor(role);

    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(username, password);

    await expect(page).toHaveURL(new RegExp(`${routes.dashboard}$`));

    const orangehrm = (await page.context().cookies()).find((cookie) => cookie.name === 'orangehrm');
    if (!orangehrm) throw new Error(`No orangehrm cookie after ${role} login`);
    saveAuthCookie(role, orangehrm.value);

    await page.context().storageState({ path: authStatePath(role) });
  });
}
