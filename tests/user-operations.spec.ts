import { disposableSystemUser } from '../utils/helpers';
import { expect, test } from '../fixtures/test';
import { routes } from '../utils/routes';

test('Create a system user for a new employee', async ({
  systemUsersPage,
  addUserPage,
  role,
  createdEmployee,
}) => {
  test.skip(role !== 'admin', 'ESS cannot open Admin');

  const user = disposableSystemUser(createdEmployee.fullName);

  await systemUsersPage.open();
  await expect(systemUsersPage.page).toHaveURL(new RegExp(`${routes.systemUsers}$`));

  await systemUsersPage.addUserButton.click();

  await addUserPage.create(user);

  await expect(systemUsersPage.page).toHaveURL(new RegExp(`${routes.systemUsers}$`));
  await systemUsersPage.searchByUsername(user.username);

  await expect(systemUsersPage.users.row(user)).toBeVisible();
});

test('Update a system user', async ({ page, systemUsersPage, editUserPage, createdUser }) => {
  const username = `edit${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  console.log('Old username', createdUser.username);
  console.log('New username', username);
  await systemUsersPage.open();
  await systemUsersPage.searchByUsername(createdUser.username);
  await systemUsersPage.users.editButton(createdUser).click();
  await expect(page).toHaveURL(/\/admin\/saveSystemUser\/\d+$/);

  await editUserPage.update({ username });

  await systemUsersPage.searchByUsername(username);

  await expect(
    systemUsersPage.users.row({
      username,
      userRole: createdUser.userRole,
      employeeName: createdUser.employeeName,
      status: createdUser.status,
    }),
  ).toBeVisible();
});

test('deletes a system user', async ({ systemUsersPage, createdUser }) => {
  await systemUsersPage.open();
  await systemUsersPage.searchByUsername(createdUser.username);
  await systemUsersPage.users.deleteButton(createdUser).click();
  await systemUsersPage.confirmDelete.click();
  await systemUsersPage.searchByUsername(createdUser.username);

  await expect(systemUsersPage.users.row(createdUser)).toHaveCount(0);
});
