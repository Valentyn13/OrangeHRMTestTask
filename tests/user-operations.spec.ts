import { disposableSystemUser } from '../utils/helpers';
import { test } from '../fixtures';
import { routes } from '../utils/routes';
import { expect } from '@playwright/test';

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

test('Update a system user', async ({ page, systemUsersPage, editUserPage, createdUser }) => {
  const newUsername = `edit${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  await systemUsersPage.open();
  await systemUsersPage.searchByUsername(createdUser.username);
  await systemUsersPage.users.editButton(createdUser).click();
  await expect(page).toHaveURL(new RegExp(`${routes.saveSystemUser}/\\d+$`));

  await editUserPage.updateUserDetails({ username: newUsername });
  await expect(page).toHaveURL(new RegExp(`${routes.systemUsers}$`));
  
  await systemUsersPage.searchByUsername(newUsername);

  await expect(
    systemUsersPage.users.row({
      username: newUsername,
      userRole: createdUser.userRole,
      employeeName: createdUser.employeeName,
      status: createdUser.status,
    }),
  ).toBeVisible();
});

test('Delete a system user', async ({ systemUsersPage, createdUser }) => {
  await systemUsersPage.open();
  await systemUsersPage.searchByUsername(createdUser.username);
  await systemUsersPage.users.deleteButton(createdUser).click();
  await systemUsersPage.confirmDelete();
  await systemUsersPage.searchByUsername(createdUser.username);

  await expect(systemUsersPage.users.row(createdUser)).toHaveCount(0);
});
