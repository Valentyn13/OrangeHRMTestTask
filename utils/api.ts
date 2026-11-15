import { request, type APIRequestContext, type APIResponse } from '@playwright/test';
import type { NewEmployee, NewSystemUser, UserRole } from './types';

const baseURL = process.env.BASE_URL ?? 'https://opensource-demo.orangehrmlive.com';

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

export async function createEmployee(cookie: string, employee: NewEmployee): Promise<NewEmployee> {
  return api(cookie, async (context) => {
    const response = await context.post('/web/index.php/api/v2/pim/employees', {
      data: {
        empPicture: null,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        middleName: '',
        lastName: employee.lastName,
      },
    });
    const created = JSON.parse(await readOk(response, 'createEmployee')) as CreatedEmployeeResponse;
    return {
      empNumber: created.data.empNumber,
      firstName: created.data.firstName,
      lastName: created.data.lastName,
      fullName: `${created.data.firstName} ${created.data.lastName}`,
      employeeId: created.data.employeeId,
    };
  });
}

export async function createUser(
  cookie: string,
  empNumber: number,
  user: NewSystemUser,
): Promise<NewSystemUser> {
  return api(cookie, async (context) => {
    const response = await context.post('/web/index.php/api/v2/admin/users', {
      data: {
        empNumber,
        username: user.username,
        password: user.password,
        status: user.status === 'Enabled',
        userRoleId: userRoleIds[user.userRole],
      },
    });
    const created = JSON.parse(await readOk(response, 'createUser')) as CreatedUserResponse;
    const { firstName, middleName, lastName } = created.data.employee;
    return {
      username: created.data.userName,
      password: user.password,
      userRole: roleFromId(created.data.userRole.id),
      status: created.data.status ? 'Enabled' : 'Disabled',
      employeeName: [firstName, middleName, lastName].filter(Boolean).join(' '),
    };
  });
}

function roleFromId(id: number): UserRole {
  const role = (Object.entries(userRoleIds) as [UserRole, number][]).find(([, roleId]) => roleId === id);
  if (!role) throw new Error(`Unknown userRoleId ${id}`);
  return role[0];
}

async function api<T>(cookie: string, run: (context: APIRequestContext) => Promise<T>): Promise<T> {
  const context = await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Accept: 'application/json',
      Cookie: `orangehrm=${cookie}`,
    },
  });
  try {
    return await run(context);
  } finally {
    await context.dispose();
  }
}

async function readOk(response: APIResponse, label: string): Promise<string> {
  const body = await response.text();
  if (!response.ok()) throw new Error(`${label} failed: ${response.status()} ${body}`);
  return body;
}
