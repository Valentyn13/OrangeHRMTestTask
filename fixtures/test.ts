import { test as base, expect } from '@playwright/test';
import { AddEmployeeForm } from '../pages/components/add-employee.form';
import { AddUserPage } from '../pages/add-user.page';
import { CandidatesPage } from '../pages/candidates.page';
import { readAuthCookie } from '../config/env';
import { createEmployee, createUser } from '../utils/api';
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
  candidatesPage: CandidatesPage;
  createdEmployee: NewEmployee;
  createdUser: NewSystemUser;
  orangehrmCookie: string;
};

export const test = base.extend<PageFixtures & RoleOptions>({
  role: ['admin', { option: true }],

  orangehrmCookie: async ({ role }, use) => {
    await use(readAuthCookie(role));
  },

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
  candidatesPage: async ({ page }, use) => {
    await use(new CandidatesPage(page));
  },
  createdEmployee: async ({ role, orangehrmCookie }, use, testInfo) => {
    testInfo.skip(role !== 'admin', 'ESS cannot create employees');

    const employee = await createEmployee(orangehrmCookie, disposableEmployee());
    await use(employee);
  },
  createdUser: async ({ role, orangehrmCookie, createdEmployee }, use, testInfo) => {
    testInfo.skip(role !== 'admin', 'ESS cannot create users');
    if (createdEmployee.empNumber == null) throw new Error('createdEmployee is missing empNumber');

    const user = await createUser(
      orangehrmCookie,
      createdEmployee.empNumber,
      disposableSystemUser(createdEmployee.fullName),
    );
    await use(user);
  },
});

export { expect };
