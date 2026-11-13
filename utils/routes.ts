export const routes = {
  login: '/web/index.php/auth/login',
  dashboard: '/web/index.php/dashboard/index',
  myInfo: '/web/index.php/pim/viewMyDetails',
  adminModule: '/web/index.php/admin/viewAdminModule',
  systemUsers: '/web/index.php/admin/viewSystemUsers',
  saveSystemUser: '/web/index.php/admin/saveSystemUser',
  employeeList: '/web/index.php/pim/viewEmployeeList',
  addEmployee: '/web/index.php/pim/addEmployee',
} as const;
