import { vacancyColumns } from '../pages/components/vacancies-table';
import { test } from '../fixtures';
import { expect } from '@playwright/test';
import type { VacancyStatus } from '../utils/types';
import { defaultSelectTextValue, statusOfVacancy } from '../utils/helpers';


test('Filter vacancies by name', async ({ vacanciesPage, createdVacancies }) => {
  const vacancy = createdVacancies[0];
  await vacanciesPage.open();

  await vacanciesPage.applyFilters({ vacancy: vacancy.name });

  await expect.poll(async () => vacanciesPage.recordCount()).toBe(1);
  await vacanciesPage.vacanciesTable.expectColumn(vacancyColumns.vacancy, vacancy.name);
});

test('Filter vacancies by job title', async ({ vacanciesPage, createdVacancies }) => {
  const vacancy = createdVacancies[0];
  await vacanciesPage.open();

  await vacanciesPage.applyFilters({ jobTitle: vacancy.jobTitle });

  await expect.poll(async () => vacanciesPage.recordCount()).toBeGreaterThan(0);
  await vacanciesPage.vacanciesTable.expectColumn(vacancyColumns.jobTitle, vacancy.jobTitle);
  expect(await vacanciesPage.vacanciesTable.columnTexts(vacancyColumns.vacancy)).toContain(vacancy.name);
});

test('Filter vacancies by hiring manager', async ({ vacanciesPage, createdVacancies }) => {
  const vacancy = createdVacancies[0];
  await vacanciesPage.open();

  await vacanciesPage.applyFilters({ hiringManager: vacancy.hiringManager });

  await expect.poll(async () => vacanciesPage.recordCount()).toBe(1);
  await vacanciesPage.vacanciesTable.expectColumn(vacancyColumns.hiringManager, vacancy.hiringManager);
  await vacanciesPage.vacanciesTable.expectColumn(vacancyColumns.vacancy, vacancy.name);
});

test('Filter vacancies by status', async ({ vacanciesPage, createdVacancies }) => {
  const vacancy = createdVacancies[0];
  const status = statusOfVacancy(vacancy);
  const other: VacancyStatus = status === 'Active' ? 'Closed' : 'Active';
  await vacanciesPage.open();

  await vacanciesPage.applyFilters({ vacancy: vacancy.name, status: other });
  await expect.poll(async () => vacanciesPage.recordCount()).toBe(0);

  await vacanciesPage.applyFilters({ vacancy: vacancy.name, status });
  await expect.poll(async () => vacanciesPage.recordCount()).toBe(1);
  await vacanciesPage.vacanciesTable.expectColumn(vacancyColumns.status, status);
});

test('Filter vacancies by job title and name together', async ({ vacanciesPage, createdVacancies }) => {
  const vacancy = createdVacancies[0];
  await vacanciesPage.open();

  await vacanciesPage.applyFilters({
    jobTitle: vacancy.jobTitle,
    vacancy: vacancy.name,
  });

  await expect.poll(async () => vacanciesPage.recordCount()).toBe(1);
  await vacanciesPage.vacanciesTable.expectColumn(vacancyColumns.jobTitle, vacancy.jobTitle);
  await vacanciesPage.vacanciesTable.expectColumn(vacancyColumns.vacancy, vacancy.name);
});

test('Reset vacancy filters', async ({ vacanciesPage, createdVacancies }) => {
  const vacancy = createdVacancies[0];
  const status = statusOfVacancy(vacancy);
  const { searchInput } = vacanciesPage;
  await vacanciesPage.open();

  await searchInput.selectJobTitle(vacancy.jobTitle);
  await searchInput.selectVacancy(vacancy.name);
  await searchInput.selectHiringManager(vacancy.hiringManager);
  await searchInput.selectStatus(status);

  await searchInput.clear();

  await expect(searchInput.jobTitle).toHaveText(defaultSelectTextValue);
  await expect(searchInput.vacancyInput).toHaveText(defaultSelectTextValue);
  await expect(searchInput.hiringManagerInput).toHaveText(defaultSelectTextValue);
  await expect(searchInput.status).toHaveText(defaultSelectTextValue);
});
