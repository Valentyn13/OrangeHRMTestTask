import { test as base } from '@playwright/test';
import { readAuthCookie } from '../config/env';
import {
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
  createdVacancies: NewVacancy[];
  createdCandidates: NewCandidate[];
};
type WorkerSetupFixtures = {
  role: Role;
  orangehrmCookie: string;
};

export const testSetupFixture = base.extend<TestSetupFixtures, WorkerSetupFixtures>({
  role: ['admin', { option: true, scope: 'worker' }],

  orangehrmCookie: [async ({ role }, use) => {
    await use(readAuthCookie(role));
  }, {scope: 'worker'}],
  
  createdEmployee: async ({ orangehrmCookie }, use) => {
    //Setup
    const employee = await createEmployee(orangehrmCookie, disposableEmployee());

    await use(employee);

    //Teardown
    if (employee.empNumber == null) return;
    const userIds = await userIdsByEmployee(orangehrmCookie, employee.empNumber);
    await deleteUsers(orangehrmCookie, userIds);
    await deleteEmployees(orangehrmCookie, [employee.empNumber]);
  },
  createdUser: async ({ orangehrmCookie, createdEmployee }, use) => {
    if (createdEmployee.empNumber == null) throw new Error('createdEmployee is missing empNumber');

    //Setup
    const user = await createUser(
      orangehrmCookie,
      createdEmployee.empNumber,
      disposableSystemUser(createdEmployee.fullName),
    );

    await use(user);

    //Teardown
    if (user.id != null) await deleteUsers(orangehrmCookie, [user.id]);
  },
  createdVacancies: async ({ orangehrmCookie }, use) => {
    const jobTitleId = await firstJobTitleId(orangehrmCookie);
    const employeeId = await firstEmployeeNumber(orangehrmCookie);

    const vacancies: NewVacancy[] = [];
    try {
      vacancies.push(await createVacancy(orangehrmCookie, disposableVacancy(jobTitleId, employeeId, 0)));

      await use(vacancies);
    } finally {
      await deleteVacancies(
        orangehrmCookie,
        vacancies.flatMap((vacancy) => (vacancy.id == null ? [] : [vacancy.id])),
      );
    }
  },
  createdCandidates: async ({ orangehrmCookie, createdVacancies }, use) => {
    const candidates: NewCandidate[] = [];
    try {
      candidates.push(await createCandidate(orangehrmCookie, disposableCandidate(createdVacancies[0], 0)));

      await use(candidates);
    } finally {
      await deleteCandidates(
        orangehrmCookie,
        candidates.flatMap((candidate) => (candidate.id == null ? [] : [candidate.id])),
      );
    }
  },
});
