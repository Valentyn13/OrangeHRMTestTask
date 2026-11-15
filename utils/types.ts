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
    id?: number;
  };

export type NewEmployee = {
    firstName: string;
    lastName: string;
    fullName: string;
    employeeId: string;
    empNumber?: number;
  };

export const roles = ['admin', 'ess'] as const;
export type Role = (typeof roles)[number];

export const candidateStatuses = [
  'Application Initiated',
  'Shortlisted',
  'Rejected',
  'Interview Scheduled',
  'Interview Passed',
  'Interview Failed',
  'Job Offered',
  'Offer Declined',
  'Hired',
] as const;
export type CandidateStatus = (typeof candidateStatuses)[number];

export type ApplicationMethod = 'Manual' | 'Online';

export type CandidateFilters = {
  jobTitle?: string;
  vacancy?: string;
  hiringManager?: string;
  status?: CandidateStatus;
  candidateName?: string;
  keywords?: string;
  applicationFrom?: string;
  applicationTo?: string;
  method?: ApplicationMethod;
};

export type RoleOptions = {
  role: Role;
};
