import { test as base } from '@playwright/test';
import { AddEmployeeForm } from '../pages/components/add-employee.form';
import { AddUserPage } from '../pages/add-user.page';
import { CandidatesPage } from '../pages/candidates.page';
import { VacanciesPage } from '../pages/vacancies.page';
import { RoleOptions } from '../utils/types';
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
    vacanciesPage: VacanciesPage;
  };

  export const pageObjectFixture = base.extend<PageFixtures & RoleOptions>({
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
      vacanciesPage: async ({ page }, use) => {
        await use(new VacanciesPage(page));
      },
  });