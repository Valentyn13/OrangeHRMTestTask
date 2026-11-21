export type UserRole = 'Admin' | 'ESS';
export type UserStatus = 'Enabled' | 'Disabled';

export type SystemUser = {
  username: string;
  userRole: UserRole;
  employeeName: string;
  status: UserStatus;
};

export type UserInput = {
  userRole: UserRole;
  employeeName: string;
  status: UserStatus;
  username: string;
  password: string;
};

export type User = UserInput & {
  id: number;
};

export type EmployeeInput = {
  firstName: string;
  lastName: string;
  employeeId: string;
};

export type Employee = EmployeeInput & {
  empNumber: number;
  fullName: string;
};

export type VacancyInput = {
  name: string;
  jobTitleId: number;
  hiringManagerEmpNumber: number;
  numOfPositions: number | null;
  description: string;
  isOpen: boolean;
  isPublished: boolean;
};

export type Vacancy = VacancyInput & {
  id: number;
  jobTitle: string;
  hiringManager: string;
};

export const vacancyStatuses = ['Active', 'Closed'] as const;
export type VacancyStatus = (typeof vacancyStatuses)[number];

export type VacancyFilters = {
  jobTitle?: string;
  vacancy?: string;
  hiringManager?: string;
  status?: VacancyStatus;
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

export type CandidateInput = {
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
  vacancyId: number;
  vacancy: string;
  jobTitle: string;
  hiringManager: string;
  status: CandidateStatus;
  method: ApplicationMethod;
};

export type Candidate = CandidateInput & {
  id: number;
  applicationDate: string;
};

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

export type SearchableCandidate = Candidate;
