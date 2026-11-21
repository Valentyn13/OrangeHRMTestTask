import { test as base, type APIRequestContext } from '@playwright/test';
import { readAuthCookie } from '../config/env';
import {
  createApiContext,
  createCandidate,
  createEmployee,
  createUser,
  createVacancy,
  deleteCandidates,
  deleteEmployees,
  deleteVacancies,
  deleteUsers,
  firstJobTitleId,
  userIdsByEmployee,
} from '../utils/api';
import { disposableCandidate, disposableEmployee, disposableSystemUser, disposableVacancy } from '../utils/helpers';
import type { Candidate, Employee, Role, User, Vacancy } from '../utils/types';

type TestSetupFixtures = {
  createdEmployee: Employee;
  replacementEmployee: Employee;
  createdUser: User;
  candidateCount: number;
  createdCandidates: Candidate[];
};
type WorkerSetupFixtures = {
  role: Role;
  orangehrmCookie: string;
  apiContext: APIRequestContext;
  vacancyCount: number;
  createdVacancies: Vacancy[];
};

export const testSetupFixture = base.extend<TestSetupFixtures, WorkerSetupFixtures>({
  role: ['admin', { option: true, scope: 'worker' }],
  vacancyCount: [1, { option: true, scope: 'worker' }],
  candidateCount: [1, { option: true }],
  orangehrmCookie: [async ({ role }, use) => {
    await use(readAuthCookie(role));
  }, { scope: 'worker' }],

  apiContext: [async ({ orangehrmCookie }, use) => {
    const context = await createApiContext(orangehrmCookie);
    try {
      await use(context);
    } finally {
      await context.dispose();
    }
  }, { scope: 'worker' }],

  createdEmployee: async ({ apiContext }, use) => {
    const employee = await createEmployee(apiContext, disposableEmployee());
    try {
      await use(employee);
    } finally {
      const userIds = await userIdsByEmployee(apiContext, employee.empNumber).catch(() => []);
      await deleteUsers(apiContext, userIds);
      await deleteEmployees(apiContext, [employee.empNumber]);
    }
  },
  replacementEmployee: async ({ apiContext }, use) => {
    const employee = await createEmployee(apiContext, disposableEmployee());
    try {
      await use(employee);
    } finally {
      const userIds = await userIdsByEmployee(apiContext, employee.empNumber).catch(() => []);
      await deleteUsers(apiContext, userIds);
      await deleteEmployees(apiContext, [employee.empNumber]);
    }
  },
  createdUser: async ({ apiContext, createdEmployee }, use) => {
    const user = await createUser(
      apiContext,
      createdEmployee.empNumber,
      disposableSystemUser(createdEmployee.fullName),
    );
    try {
      await use(user);
    } finally {
      await deleteUsers(apiContext, [user.id]);
    }
  },
  createdVacancies: [async ({ apiContext, vacancyCount }, use) => {
    const jobTitleId = await firstJobTitleId(apiContext);
    const manager = await createEmployee(apiContext, disposableEmployee());
    const vacancies: Vacancy[] = [];
    try {
      for (let index = 0; index < vacancyCount; index++) {
        vacancies.push(await createVacancy(
          apiContext,
          disposableVacancy(jobTitleId, manager.empNumber, index),
        ));
      }
      await use(vacancies);
    } finally {
      await deleteVacancies(apiContext, vacancies.map((vacancy) => vacancy.id));
      await deleteEmployees(apiContext, [manager.empNumber]);
    }
  }, { scope: 'worker' }],

  createdCandidates: async ({ apiContext, createdVacancies, candidateCount }, use) => {
    if (createdVacancies.length === 0) throw new Error('createdCandidates requires vacancyCount >= 1');

    const candidates: Candidate[] = [];
    try {
      for (let index = 0; index < candidateCount; index++) {
        const vacancy = createdVacancies[index % createdVacancies.length];
        candidates.push(await createCandidate(apiContext, disposableCandidate(vacancy, index)));
      }
      await use(candidates);
    } finally {
      await deleteCandidates(apiContext, candidates.map((candidate) => candidate.id));
    }
  },
});
