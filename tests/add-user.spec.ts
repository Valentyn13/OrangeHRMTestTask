import { disposableSystemUser } from '../utils/helpers';
import { expect, test } from '../fixtures/test';

test('creates a system user for a new employee', async ({
  systemUsersPage,
  addUserForm,
  role,
  createdEmployee,
}) => {
  test.skip(role !== 'admin', 'ESS cannot open Admin');

  const user = disposableSystemUser(createdEmployee.fullName);

  await systemUsersPage.open();
  await systemUsersPage.addUserButton.click();
  await addUserForm.expectReady();
  await addUserForm.create(user);
  await systemUsersPage.searchByUsername(user.username);

  await expect(systemUsersPage.users.row(user)).toBeVisible();
});

test('updates the username', async ({ systemUsersPage, editUserForm, createdUser }) => {
  const username = `edit${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  await systemUsersPage.searchByUsername(createdUser.username);
  await systemUsersPage.users.editButton(createdUser).click();
  await editUserForm.expectReady();
  await editUserForm.update({ username });
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
  await systemUsersPage.searchByUsername(createdUser.username);
  await systemUsersPage.users.deleteButton(createdUser).click();
  await systemUsersPage.confirmDelete.click();
  await systemUsersPage.searchByUsername(createdUser.username);

  await expect(systemUsersPage.users.row(createdUser)).toHaveCount(0);
});
