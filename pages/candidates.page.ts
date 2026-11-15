import { expect, type Locator, type Page } from '@playwright/test';
import type { CandidateFilters } from '../utils/types';
import { routes } from '../utils/routes';
import { CandidatesSearchForm } from './components/candidates-search-form';
import { CandidatesTable } from './components/candidates-table';

export class CandidatesPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly addButton: Locator;
  readonly recordsFound: Locator;
  readonly search: CandidatesSearchForm;
  readonly candidates: CandidatesTable;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Candidates' });
    this.addButton = page.locator('.orangehrm-header-container').getByRole('button', { name: 'Add' });
    this.recordsFound = page.locator('.orangehrm-horizontal-padding .oxd-text--span');
    this.search = new CandidatesSearchForm(page);
    this.candidates = new CandidatesTable(page);
  }

  async open(): Promise<void> {
    const listed = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/recruitment/candidates') &&
        response.url().includes('model=list') &&
        response.ok(),
    );
    await this.page.goto(routes.candidates);
    await listed;
  }

  async recordCount(): Promise<number> {
    const text = (await this.recordsFound.innerText()).trim();
    const match = text.match(/\((\d+)\)/);
    return match ? Number(match[1]) : 0;
  }

  async applyFilters(filters: CandidateFilters): Promise<void> {
    if (filters.jobTitle) {
      await this.search.selectJobTitle(filters.jobTitle);
    }
    if (filters.vacancy) {
      await this.search.selectVacancy(filters.vacancy);
    }
    if (filters.hiringManager) {
      await this.search.selectHiringManager(filters.hiringManager);
    }
    if (filters.status) {
      await this.search.selectStatus(filters.status);
    }
    if (filters.candidateName) {
      await this.search.selectCandidate(filters.candidateName);
    }
    if (filters.keywords) {
      await this.search.fillKeywords(filters.keywords);
    }
    if (filters.applicationFrom && filters.applicationTo) {
      await this.search.fillApplicationDates(filters.applicationFrom, filters.applicationTo);
    }
    if (filters.method) {
      await this.search.selectMethod(filters.method);
    }

    await this.search.submit();
  }
}
