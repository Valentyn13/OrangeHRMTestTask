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
  firstEmployeeNumber,
  firstJobTitleId,
  userIdsByEmployee,
} from '../utils/api';
import { disposableCandidate, disposableEmployee, disposableSystemUser, disposableVacancy } from '../utils/helpers';
import { NewCandidate, NewEmployee, NewSystemUser, NewVacancy } from '../utils/types';
import type { Role } from '../utils/types';

type TestSetupFixtures = {
  createdEmployee: NewEmployee;
  createdUser: NewSystemUser;
  candidateCount: number;
  createdCandidates: NewCandidate[];
};
type WorkerSetupFixtures = {
  role: Role;
  orangehrmCookie: string;
  apiContext: APIRequestContext;
  vacancyCount: number;
  createdVacancies: NewVacancy[];
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
    //Setup
    const employee = await createEmployee(apiContext, disposableEmployee());

    await use(employee);

    //Teardown
    if (employee.empNumber == null) return;
    const userIds = await userIdsByEmployee(apiContext, employee.empNumber);
    await deleteUsers(apiContext, userIds);
    await deleteEmployees(apiContext, [employee.empNumber]);
  },
  createdUser: async ({ apiContext, createdEmployee }, use) => {
    if (createdEmployee.empNumber == null) throw new Error('createdEmployee is missing empNumber');

    //Setup
    const user = await createUser(
      apiContext,
      createdEmployee.empNumber,
      disposableSystemUser(createdEmployee.fullName),
    );

    await use(user);

    //Teardown
    if (user.id != null) await deleteUsers(apiContext, [user.id]);
  },
  createdVacancies: [async ({ apiContext, vacancyCount }, use) => {
    const jobTitleId = await firstJobTitleId(apiContext);
    const employeeId = await firstEmployeeNumber(apiContext);

    const vacancies: NewVacancy[] = [];
    try {
      for (let index = 0; index < vacancyCount; index++) {
        vacancies.push(await createVacancy(apiContext, disposableVacancy(jobTitleId, employeeId, index)));
      }

      await use(vacancies);
    } finally {
      await deleteVacancies(
        apiContext,
        vacancies.flatMap((vacancy) => (vacancy.id == null ? [] : [vacancy.id])),
      );
    }
  }, { scope: 'worker' }],
  
  createdCandidates: async ({ apiContext, createdVacancies, candidateCount }, use) => {
    if (createdVacancies.length === 0) throw new Error('createdCandidates requires vacancyCount >= 1');

    const candidates: NewCandidate[] = [];
    try {
      for (let index = 0; index < candidateCount; index++) {
        const vacancy = createdVacancies[index % createdVacancies.length];
        candidates.push(await createCandidate(apiContext, disposableCandidate(vacancy, index)));
      }

      await use(candidates);
    } finally {
      await deleteCandidates(
        apiContext,
        candidates.flatMap((candidate) => (candidate.id == null ? [] : [candidate.id])),
      );
    }
  },
});
