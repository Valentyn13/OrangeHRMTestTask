export type UserRole = 'Admin' | 'ESS';
export type UserStatus = 'Enabled' | 'Disabled';

export type SystemUser = {
  username: string;
  userRole: UserRole;
  employeeName: string;
  status: UserStatus;
};

export type NewSystemUser = {
    userRole: UserRole;
    employeeName: string;
    status: UserStatus;
    username: string;
    password: string;
  };

export type NewEmployee = {
    firstName: string;
    lastName: string;
    fullName: string;
    employeeId: string;
  };

export const roles = ['admin', 'ess'] as const;
export type Role = (typeof roles)[number];

export type RoleOptions = {
  role: Role;
};
