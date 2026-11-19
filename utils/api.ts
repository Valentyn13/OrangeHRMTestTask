import { request, type APIRequestContext, type APIResponse } from '@playwright/test';
import { baseUrl } from '../config/env';
import {
  candidateStatuses,
  type Candidate,
  type CandidateInput,
  type CandidateStatus,
  type Employee,
  type EmployeeInput,
  type User,
  type UserInput,
  type UserRole,
  type Vacancy,
  type VacancyInput,
} from './types';

const userRoleIds: Record<UserRole, number> = {
  Admin: 1,
  ESS: 2,
};

type CreatedEmployeeResponse = {
  data: {
    empNumber: number;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
};

type CreatedUserResponse = {
  data: {
    id: number;
    userName: string;
    status: boolean;
    employee: {
      firstName: string;
      middleName: string;
      lastName: string;
    };
    userRole: {
      id: number;
      name: UserRole;
    };
  };
};

type UserListResponse = {
  data: { id: number }[];
};

type CreatedVacancyResponse = {
  data: {
    id: number;
    name: string;
    description: string;
    numOfPositions: number | null;
    status: boolean;
    isPublished: boolean;
    jobTitle: { id: number; title: string };
    hiringManager: {
      id: number;
      firstName: string;
      middleName: string;
      lastName: string;
    };
  };
};

type CreatedCandidateResponse = {
  data: {
    id: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    dateOfApplication: string;
    vacancy: {
      id: number;
      name: string;
      hiringManager: {
        firstName: string;
        middleName: string;
        lastName: string;
      } | null;
    } | null;
    status: { label: string } | { label: string }[] | null;
  };
};

export function createApiContext(cookie: string): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: baseUrl(),
    extraHTTPHeaders: {
      Accept: 'application/json',
      Cookie: `orangehrm=${cookie}`,
    },
  });
}

export async function createEmployee(api: APIRequestContext, employee: EmployeeInput): Promise<Employee> {
  const response = await api.post('/web/index.php/api/v2/pim/employees', {
    data: {
      empPicture: null,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      middleName: '',
      lastName: employee.lastName,
    },
  });
  const created = readJson<CreatedEmployeeResponse>(await readOk(response, 'createEmployee'), 'createEmployee');
  return {
    empNumber: created.data.empNumber,
    firstName: created.data.firstName,
    lastName: created.data.lastName,
    fullName: `${created.data.firstName} ${created.data.lastName}`,
    employeeId: created.data.employeeId,
  };
}

export async function createUser(
  api: APIRequestContext,
  empNumber: number,
  user: UserInput,
): Promise<User> {
  const response = await api.post('/web/index.php/api/v2/admin/users', {
    data: {
      empNumber,
      username: user.username,
      password: user.password,
      status: user.status === 'Enabled',
      userRoleId: userRoleIds[user.userRole],
    },
  });
  const created = readJson<CreatedUserResponse>(await readOk(response, 'createUser'), 'createUser');
  const { firstName, middleName, lastName } = created.data.employee;
  return {
    id: created.data.id,
    username: created.data.userName,
    password: user.password,
    userRole: roleFromId(created.data.userRole.id),
    status: created.data.status ? 'Enabled' : 'Disabled',
    employeeName: [firstName, middleName, lastName].filter(Boolean).join(' '),
  };
}

export async function deleteEmployees(api: APIRequestContext, ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const response = await api.delete('/web/index.php/api/v2/pim/employees', {
    data: { ids },
  });
  await readOk(response, 'deleteEmployees', [404]);
}

export async function deleteVacancies(api: APIRequestContext, ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const response = await api.delete('/web/index.php/api/v2/recruitment/vacancies', {
    data: { ids },
  });
  await readOk(response, 'deleteVacancies', [404]);
}

export async function deleteUsers(api: APIRequestContext, ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const response = await api.delete('/web/index.php/api/v2/admin/users', {
    data: { ids },
  });
  await readOk(response, 'deleteUsers', [404]);
}

export async function createVacancy(api: APIRequestContext, vacancy: VacancyInput): Promise<Vacancy> {
  const response = await api.post('/web/index.php/api/v2/recruitment/vacancies', {
    data: {
      name: vacancy.name,
      jobTitleId: vacancy.jobTitleId,
      employeeId: vacancy.hiringManagerEmpNumber,
      numOfPositions: vacancy.numOfPositions,
      description: vacancy.description,
      status: vacancy.isOpen,
      isPublished: vacancy.isPublished,
    },
  });
  const created = readJson<CreatedVacancyResponse>(await readOk(response, 'createVacancy'), 'createVacancy');
  return {
    id: created.data.id,
    name: created.data.name,
    jobTitleId: created.data.jobTitle.id,
    hiringManagerEmpNumber: created.data.hiringManager.id,
    jobTitle: created.data.jobTitle.title,
    hiringManager: personName(created.data.hiringManager),
    numOfPositions: created.data.numOfPositions,
    description: created.data.description,
    isOpen: created.data.status,
    isPublished: created.data.isPublished,
  };
}

type IdListResponse = {
  data: { id: number }[];
};

export async function firstJobTitleId(api: APIRequestContext): Promise<number> {
  const response = await api.get('/web/index.php/api/v2/admin/job-titles', {
    params: { limit: 1, offset: 0 },
  });
  const listed = readJson<IdListResponse>(await readOk(response, 'firstJobTitleId'), 'firstJobTitleId');
  const id = listed.data[0]?.id;
  if (id == null) throw new Error('firstJobTitleId failed: no job titles');
  return id;
}

export async function createCandidate(api: APIRequestContext, candidate: CandidateInput): Promise<Candidate> {
  const response = await api.post('/web/index.php/api/v2/recruitment/candidates', {
    params: { model: 'list' },
    data: {
      firstName: candidate.firstName,
      middleName: candidate.middleName,
      lastName: candidate.lastName,
      email: candidate.email,
      contactNumber: candidate.contactNumber,
      keywords: candidate.keywords,
      comment: candidate.comment,
      dateOfApplication: candidate.dateOfApplication,
      consentToKeepData: candidate.consentToKeepData,
      vacancyId: candidate.vacancyId,
    },
  });
  const created = readJson<CreatedCandidateResponse>(await readOk(response, 'createCandidate'), 'createCandidate');
  const fullName = [created.data.firstName, created.data.middleName, created.data.lastName]
    .filter(Boolean)
    .join(' ');
  return {
    id: created.data.id,
    firstName: created.data.firstName,
    middleName: created.data.middleName ?? '',
    lastName: created.data.lastName,
    fullName,
    email: candidate.email,
    contactNumber: candidate.contactNumber,
    keywords: candidate.keywords,
    comment: candidate.comment,
    dateOfApplication: candidate.dateOfApplication,
    applicationDate: uiDate(created.data.dateOfApplication),
    consentToKeepData: candidate.consentToKeepData,
    vacancyId: created.data.vacancy?.id ?? candidate.vacancyId,
    vacancy: created.data.vacancy?.name ?? candidate.vacancy,
    jobTitle: candidate.jobTitle,
    hiringManager: created.data.vacancy?.hiringManager
      ? personName(created.data.vacancy.hiringManager)
      : candidate.hiringManager,
    status: candidateStatus(created.data.status) ?? candidate.status,
    method: 'Manual',
  };
}

export async function deleteCandidates(api: APIRequestContext, ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const response = await api.delete('/web/index.php/api/v2/recruitment/candidates', {
    data: { ids },
  });
  await readOk(response, 'deleteCandidates', [404]);
}

export async function userIdsByEmployee(api: APIRequestContext, empNumber: number): Promise<number[]> {
  const response = await api.get('/web/index.php/api/v2/admin/users', {
    params: { empNumber, limit: 50, offset: 0 },
  });
  const listed = readJson<UserListResponse>(await readOk(response, 'userIdsByEmployee'), 'userIdsByEmployee');
  return listed.data.map((user) => user.id);
}

function uiDate(apiDate: string): string {
  const [year, month, day] = apiDate.split('-');
  if (!year || !month || !day) return apiDate;
  return `${year}-${day}-${month}`;
}

function personName(person: { firstName: string; middleName: string; lastName: string }): string {
  return [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ');
}

function candidateStatus(status: { label: string } | { label: string }[] | null): CandidateStatus | undefined {
  const label = Array.isArray(status) ? status[0]?.label : status?.label;
  if (label == null) return undefined;
  if ((candidateStatuses as readonly string[]).includes(label)) return label as CandidateStatus;
  throw new Error(`Unknown candidate status ${label}`);
}

function roleFromId(id: number): UserRole {
  const role = (Object.entries(userRoleIds) as [UserRole, number][]).find(([, roleId]) => roleId === id);
  if (!role) throw new Error(`Unknown userRoleId ${id}`);
  return role[0];
}

function readJson<T>(body: string, label: string): T {
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`${label} returned non-JSON: ${body.slice(0, 500)}`);
  }
}

async function readOk(response: APIResponse, label: string, accept: number[] = []): Promise<string> {
  const body = await response.text();
  if (!response.ok() && !accept.includes(response.status())) {
    throw new Error(`${label} failed: ${response.status()} ${body}`);
  }
  return body;
}
