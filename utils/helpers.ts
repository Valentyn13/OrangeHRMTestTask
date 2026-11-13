import type { NewEmployee, NewSystemUser } from "./types";
const letters = 'abcdefghijklmnopqrstuvwxyz';

function randomLetters(length: number): string {
  return Array.from({ length }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
}

export function disposableEmployee(): NewEmployee {
  const firstName = `Emp${Date.now().toString(36).replace(/\d/g, (digit) => letters[Number(digit)])}${randomLetters(3)}`;
  const lastName = `Ln${randomLetters(8)}`;
  const employeeId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.slice(-10);

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    employeeId,
  };
}


export function disposableSystemUser(employeeName: string): NewSystemUser {
    return {
      userRole: 'ESS',
      employeeName,
      status: 'Enabled',
      username: `user${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      password: 'Abcdef1',
    };
  }