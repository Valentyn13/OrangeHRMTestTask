import { disposableSystemUser } from '../utils/helpers';
import { test } from '../fixtures';
import { routes } from '../utils/routes';
import { expect } from '@playwright/test';
import type { SystemUser } from '../utils/types';

test('Create a system user for a new employee', async ({
  systemUsersPage,
  addUserPage,
  page,
  createdEmployee,
}) => {

  const user = disposableSystemUser(createdEmployee.fullName);

  await systemUsersPage.open();
  await expect(systemUsersPage.page).toHaveURL(new RegExp(`${routes.systemUsers}$`));

  await systemUsersPage.addUserButton.click();
  await expect(page).toHaveURL(new RegExp(`${routes.saveSystemUser}$`));

  await addUserPage.create(user);

  await expect(systemUsersPage.page).toHaveURL(new RegExp(`${routes.systemUsers}$`));
  await systemUsersPage.searchByUsername(user.username);

  await expect(systemUsersPage.users.row(user)).toBeVisible();
});

test('Update a system user', async ({
  page,
  systemUsersPage,
  editUserPage,
  createdUser,
  replacementEmployee,
}) => {
  const updated: SystemUser = {
    username: `edit${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    userRole: createdUser.userRole === 'Admin' ? 'ESS' : 'Admin',
    employeeName: replacementEmployee.fullName,
    status: createdUser.status === 'Enabled' ? 'Disabled' : 'Enabled',
  };

  await systemUsersPage.open();
  await systemUsersPage.searchByUsername(createdUser.username);
  await systemUsersPage.users.editButton(createdUser).click();
  await expect(page).toHaveURL(new RegExp(`${routes.saveSystemUser}/\\d+$`));

  await editUserPage.updateUserDetails(updated);
  await expect(page).toHaveURL(new RegExp(`${routes.systemUsers}$`));

  await systemUsersPage.searchByUsername(updated.username);

  await expect(systemUsersPage.users.row(updated)).toBeVisible();
});

test('Delete a system user', async ({ systemUsersPage, createdUser }) => {
  await systemUsersPage.open();
  await systemUsersPage.searchByUsername(createdUser.username);
  await systemUsersPage.users.deleteButton(createdUser).click();
  await systemUsersPage.confirmDelete();
  await systemUsersPage.searchByUsername(createdUser.username);

  await expect(systemUsersPage.users.row(createdUser)).toHaveCount(0);
});
