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

export type NewVacancy = {
  name: string;
  jobTitleId: number;
  employeeId: number;
  numOfPositions: number | null;
  description: string;
  status: boolean;
  isPublished: boolean;
  id?: number;
  jobTitle?: string;
  hiringManager?: string;
};

export type NewCandidate = {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  email: string;
  contactNumber: string | null;
  keywords: string;
  comment: string;
  dateOfApplication: string;
  consentToKeepData: boolean;
  vacancyId?: number;
  id?: number;
  vacancy?: string;
  jobTitle?: string;
  hiringManager?: string;
  status?: CandidateStatus;
  method?: ApplicationMethod;
  applicationDate?: string;
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


export type SearchableCandidate = NewCandidate & {
  vacancy: string;
  jobTitle: string;
  hiringManager: string;
  status: CandidateStatus;
  method: ApplicationMethod;
  applicationDate: string;
};