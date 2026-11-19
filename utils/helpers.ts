import type { Candidate, CandidateInput, EmployeeInput, SearchableCandidate, UserInput, Vacancy, VacancyInput } from "./types";
const letters = 'abcdefghijklmnopqrstuvwxyz';

function randomLetters(length: number): string {
  return Array.from({ length }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
}

export function disposableEmployee(): EmployeeInput {
  const firstName = `Emp${Date.now().toString(36).replace(/\d/g, (digit) => letters[Number(digit)])}${randomLetters(3)}`;
  const lastName = `Ln${randomLetters(8)}`;
  const employeeId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.slice(-10);

  return {
    firstName,
    lastName,
    employeeId,
  };
}

export function disposableVacancy(jobTitleId: number, hiringManagerEmpNumber: number, index: number): VacancyInput {
  const name = `Vac${index}${Date.now().toString(36).replace(/\d/g, (digit) => letters[Number(digit)])}${randomLetters(4)}`;
  return {
    name,
    jobTitleId,
    hiringManagerEmpNumber,
    numOfPositions: null,
    description: name,
    isOpen: true,
    isPublished: true,
  };
}

export function disposableCandidate(vacancy: Vacancy, index: number): CandidateInput {
  const stamp = Date.now().toString(36).replace(/\d/g, (digit) => letters[Number(digit)]);
  const firstName = `Can${index}${stamp}`.slice(0, 30);
  const middleName = 'M';
  const lastName = `Ln${randomLetters(5)}`;
  const date = new Date();
  date.setDate(date.getDate() - index);

  return {
    firstName,
    middleName,
    lastName,
    fullName: `${firstName} ${middleName} ${lastName}`,
    email: `${firstName}.${lastName}@example.com`.toLowerCase(),
    contactNumber: `050000${String(index).padStart(4, '0')}`,
    keywords: `kw${stamp}${index}${randomLetters(3)}`,
    comment: 'Some notes',
    dateOfApplication: [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-'),
    consentToKeepData: true,
    vacancyId: vacancy.id,
    vacancy: vacancy.name,
    jobTitle: vacancy.jobTitle,
    hiringManager: vacancy.hiringManager,
    status: 'Application Initiated',
    method: 'Manual',
  };
}

export function disposableSystemUser(employeeName: string): UserInput {
  return {
    userRole: 'ESS',
    employeeName,
    status: 'Enabled',
    username: `user${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    password: 'Abcdef1',
  };
}

export function shiftApplicationDate(applicationDate: string, days: number): string {
  const [year, day, month] = applicationDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const shiftedDay = String(date.getUTCDate()).padStart(2, '0');
  const shiftedMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${date.getUTCFullYear()}-${shiftedDay}-${shiftedMonth}`;
}

export function searchable(candidate: Candidate): SearchableCandidate {
  const { vacancy, jobTitle, hiringManager, status, method, applicationDate } = candidate;
  if (!vacancy || !jobTitle || !hiringManager || !status || !method || !applicationDate) {
    throw new Error(`created candidate ${candidate.fullName} is missing search fields`);
  }
  return candidate;
}
