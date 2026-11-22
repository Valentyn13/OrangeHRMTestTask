import { candidateColumns } from '../pages/components/candidates-table';
import { test } from '../fixtures';
import { expect } from '@playwright/test';
import { defaultSelectTextValue, searchable, shiftApplicationDate } from '../utils/helpers';
test.describe.configure({ timeout: 180_000 });

test('Filter candidates by name', async ({ candidatesPage, createdCandidates }) => {
  const candidate = searchable(createdCandidates[0]);
  await candidatesPage.open();

  await candidatesPage.applyFilters({ candidateName: candidate.firstName });

  await expect.poll(async () => candidatesPage.recordCount()).toBe(1);
  await candidatesPage.candidatesTable.expectColumn(candidateColumns.candidate, candidate.fullName);
});

test('Filter candidates by vacancy', async ({ candidatesPage, createdCandidates }) => {
  const candidate = searchable(createdCandidates[0]);
  await candidatesPage.open();

  await candidatesPage.applyFilters({ vacancy: candidate.vacancy });

  await expect.poll(async () => candidatesPage.recordCount()).toBe(1);
  await candidatesPage.candidatesTable.expectColumn(candidateColumns.vacancy, candidate.vacancy);
  await candidatesPage.candidatesTable.expectColumn(candidateColumns.candidate, candidate.fullName);
});

test('Filter candidates by job title', async ({ candidatesPage, createdCandidates }) => {
  const candidate = searchable(createdCandidates[0]);
  await candidatesPage.open();

  await candidatesPage.applyFilters({ jobTitle: candidate.jobTitle, keywords: candidate.keywords });

  await expect.poll(async () => candidatesPage.recordCount()).toBe(1);
  await candidatesPage.candidatesTable.expectColumn(candidateColumns.vacancy, candidate.vacancy);
  await candidatesPage.candidatesTable.expectColumn(candidateColumns.candidate, candidate.fullName);
});

test('Filter candidates by status', async ({ candidatesPage, createdCandidates }) => {
  const candidate = searchable(createdCandidates[0]);
  await candidatesPage.open();

  await candidatesPage.applyFilters({ status: 'Rejected', keywords: candidate.keywords });
  await expect.poll(async () => candidatesPage.recordCount()).toBe(0);

  await candidatesPage.applyFilters({ status: candidate.status, keywords: candidate.keywords });
  await expect.poll(async () => candidatesPage.recordCount()).toBe(1);
  await candidatesPage.candidatesTable.expectColumn(candidateColumns.status, candidate.status);
});

test('Filter candidates by application date', async ({ candidatesPage, createdCandidates }) => {
  const candidate = searchable(createdCandidates[0]);
  const previous = shiftApplicationDate(candidate.applicationDate, -1);
  const older = shiftApplicationDate(candidate.applicationDate, -2);
  await candidatesPage.open();

  await candidatesPage.applyFilters({
    keywords: candidate.keywords,
    applicationFrom: older,
    applicationTo: previous,
  });
  await expect.poll(async () => candidatesPage.recordCount()).toBe(0);

  await candidatesPage.searchInput.clear();
  await candidatesPage.applyFilters({
    keywords: candidate.keywords,
    applicationFrom: previous,
    applicationTo: candidate.applicationDate,
  });
  await expect.poll(async () => candidatesPage.recordCount()).toBe(1);
  await candidatesPage.candidatesTable.expectApplicationDatesBetween(previous, candidate.applicationDate);
});

test('Filter candidates by keywords', async ({ candidatesPage, createdCandidates }) => {
  const candidate = searchable(createdCandidates[0]);
  await candidatesPage.open();

  await candidatesPage.applyFilters({ keywords: 'zzznomatchkeyword' });
  await expect(candidatesPage.recordsFound).toHaveText('No Records Found');
  await expect.poll(async () => candidatesPage.recordCount()).toBe(0);

  await candidatesPage.applyFilters({ keywords: candidate.keywords });
  await expect.poll(async () => candidatesPage.recordCount()).toBe(1);
  await candidatesPage.candidatesTable.expectColumn(candidateColumns.candidate, candidate.fullName);
});

test('Filter candidates by method of application', async ({ candidatesPage, createdCandidates }) => {
  const candidate = searchable(createdCandidates[0]);
  await candidatesPage.open();

  await candidatesPage.applyFilters({ method: 'Online', keywords: candidate.keywords });
  await expect.poll(async () => candidatesPage.recordCount()).toBe(0);

  await candidatesPage.applyFilters({ method: candidate.method, keywords: candidate.keywords });
  await expect.poll(async () => candidatesPage.recordCount()).toBe(1);
  await candidatesPage.candidatesTable.expectColumn(candidateColumns.candidate, candidate.fullName);
});

test('Filter candidates by status and vacancy together', async ({ candidatesPage, createdCandidates }) => {
  const candidate = searchable(createdCandidates[0]);
  await candidatesPage.open();

  await candidatesPage.applyFilters({
    vacancy: candidate.vacancy,
    status: candidate.status,
  });

  await expect.poll(async () => candidatesPage.recordCount()).toBe(1);
  await candidatesPage.candidatesTable.expectColumn(candidateColumns.vacancy, candidate.vacancy);
  await candidatesPage.candidatesTable.expectColumn(candidateColumns.status, candidate.status);
});

test('Reset candidate filters', async ({ candidatesPage, createdCandidates }) => {
  const candidate = searchable(createdCandidates[0]);
  const { searchInput } = candidatesPage;
  await candidatesPage.open();

  await searchInput.selectJobTitle(candidate.jobTitle);
  await searchInput.selectVacancy(candidate.vacancy);
  await searchInput.selectHiringManager(candidate.hiringManager);
  await searchInput.selectStatus(candidate.status);
  await searchInput.selectCandidate(candidate.firstName);
  await searchInput.fillKeywords(candidate.keywords);
  await searchInput.fillApplicationDates(
    shiftApplicationDate(candidate.applicationDate, -1),
    candidate.applicationDate,
  );
  await searchInput.selectMethod(candidate.method);

  await searchInput.clear();

  await expect(searchInput.jobTitle).toHaveText(defaultSelectTextValue);
  await expect(searchInput.vacancyInput).toHaveText(defaultSelectTextValue);
  await expect(searchInput.hiringManagerInput).toHaveText(defaultSelectTextValue);
  await expect(searchInput.status).toHaveText(defaultSelectTextValue);
  await expect(searchInput.candidateNameInput).toHaveValue('');
  await expect(searchInput.keywordsInput).toHaveValue('');
  await expect(searchInput.applicationFromInput).toHaveValue('');
  await expect(searchInput.applicationToInput).toHaveValue('');
  await expect(searchInput.method).toHaveText(defaultSelectTextValue);
});
