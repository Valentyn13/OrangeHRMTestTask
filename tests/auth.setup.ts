import { expect, test as setup } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { authStatePath, credentialsForAdmin, ensureAuthDir, saveAuthCookie } from '../config/env';
import { routes } from '../utils/routes';

  setup(`Authenticate as admin`, async ({ page }) => {
    ensureAuthDir();
    const { username, password } = credentialsForAdmin();

    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(username, password);

    await expect(page).toHaveURL(new RegExp(`${routes.dashboard}$`));

    const orangehrm = (await page.context().cookies()).find((cookie) => cookie.name === 'orangehrm');
    if (!orangehrm) throw new Error(`No orangehrm cookie after admin login`);
    saveAuthCookie('admin', orangehrm.value);

  await page.context().storageState({ path: authStatePath('admin') });
});
