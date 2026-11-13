import { test as base, expect } from '@playwright/test';
import { AddEmployeeForm } from '../pages/components/add-employee.form';
import { AddUserForm } from '../pages/components/add-user.form';
import { disposableEmployee, disposableSystemUser } from '../utils/helpers';
import { NewEmployee, NewSystemUser, RoleOptions } from '../utils/types';
import { DashboardPage } from '../pages/dashboard.page';
import { EditUserForm } from '../pages/components/edit-user.form';
import { EmployeeListPage } from '../pages/employee-list.page';
import { LoginPage } from '../pages/login.page';
import { MyInfoPage } from '../pages/my-info.page';
import { SystemUsersPage } from '../pages/system-users.page';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  systemUsersPage: SystemUsersPage;
  employeeListPage: EmployeeListPage;
  addEmployeeForm: AddEmployeeForm;
  addUserForm: AddUserForm;
  editUserForm: EditUserForm;
  myInfoPage: MyInfoPage;
  createdEmployee: NewEmployee;
  createdUser: NewSystemUser;
};

export const test = base.extend<PageFixtures & RoleOptions>({
  role: ['admin', { option: true }],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  systemUsersPage: async ({ page }, use) => {
    await use(new SystemUsersPage(page));
  },
  employeeListPage: async ({ page }, use) => {
    await use(new EmployeeListPage(page));
  },
  addEmployeeForm: async ({ page }, use) => {
    await use(new AddEmployeeForm(page));
  },
  addUserForm: async ({ page }, use) => {
    await use(new AddUserForm(page));
  },
  editUserForm: async ({ page }, use) => {
    await use(new EditUserForm(page));
  },
  myInfoPage: async ({ page }, use) => {
    await use(new MyInfoPage(page));
  },
  createdEmployee: async ({ role, employeeListPage, addEmployeeForm }, use, testInfo) => {
    testInfo.skip(role !== 'admin', 'ESS cannot open PIM');

    const employee = disposableEmployee();
    await employeeListPage.open();
    await employeeListPage.addButton.click();
    await addEmployeeForm.create(employee);
    await use(employee);
  },
  createdUser: async ({ role, systemUsersPage, addUserForm, createdEmployee }, use, testInfo) => {
    testInfo.skip(role !== 'admin', 'ESS cannot open Admin');

    const user = disposableSystemUser(createdEmployee.fullName);
    await systemUsersPage.open();
    await systemUsersPage.addUserButton.click();
    await addUserForm.expectReady();
    await addUserForm.create(user);
    await use(user);
  },
});

export { expect };
