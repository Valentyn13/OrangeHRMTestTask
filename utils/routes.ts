import { baseUrl } from '../config/env';

export const routes = {
  login: 'auth/login',
  dashboard: 'dashboard/index',
  myInfo: 'pim/viewMyDetails',
  adminModule: 'admin/viewAdminModule',
  systemUsers: 'admin/viewSystemUsers',
  saveSystemUser: 'admin/saveSystemUser',
  employeeList: 'pim/viewEmployeeList',
  addEmployee: 'pim/addEmployee',
  candidates: 'recruitment/viewCandidates',
  employeeDetails: (empNumber: number) => `pim/viewPersonalDetails/empNumber/${empNumber}`,
} as const;

export const apiRoutes = {
  employees: 'api/v2/pim/employees',
  users: 'api/v2/admin/users',
  vacancies: 'api/v2/recruitment/vacancies',
  jobTitles: 'api/v2/admin/job-titles',
  candidates: 'api/v2/recruitment/candidates',
} as const;

export const urls = {
  adminUsers: '/api/v2/admin/users',
  userNameValidation: '/api/v2/admin/validation/user-name',
  candidates: '/api/v2/recruitment/candidates',
  employeeDetails: (empNumber: number) =>
    new RegExp(`/pim/viewPersonalDetails/empNumber/${empNumber}$`),
  employeeDetailsPattern: /\/pim\/viewPersonalDetails\/empNumber\/\d+$/,
} as const;

export function pageHref(route: string): string {
  const pathname = new URL(baseUrl()).pathname.replace(/\/$/, '');
  return `${pathname}/${route}`;
}
