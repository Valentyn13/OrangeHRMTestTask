import { test as base, expect } from '@playwright/test';
import { AddEmployeeForm } from '../pages/components/add-employee.form';
import { AddUserPage } from '../pages/add-user.page';
import { disposableEmployee, disposableSystemUser } from '../utils/helpers';
import { NewEmployee, NewSystemUser, RoleOptions } from '../utils/types';
import { DashboardPage } from '../pages/dashboard.page';
import { EditUserPage } from '../pages/edit-user.page';
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
  addUserPage: AddUserPage;
  editUserPage: EditUserPage;
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
  addUserPage: async ({ page }, use) => {
    await use(new AddUserPage(page));
  },
  editUserPage: async ({ page }, use) => {
    await use(new EditUserPage(page));
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
  createdUser: async ({ role, systemUsersPage, addUserPage, createdEmployee }, use, testInfo) => {
    testInfo.skip(role !== 'admin', 'ESS cannot open Admin');

    const user = disposableSystemUser(createdEmployee.fullName);
    await systemUsersPage.open();
    await systemUsersPage.addUserButton.click();
    await addUserPage.create(user);
    await use(user);
  },
});

export { expect };
