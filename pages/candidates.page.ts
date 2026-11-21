import { expect, type Locator, type Page } from '@playwright/test';
import type { CandidateFilters } from '../utils/types';
import { routes, urls } from '../utils/routes';
import { CandidatesSearchForm } from './components/candidates-search-form';
import { CandidatesTable } from './components/candidates-table';

export class CandidatesPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly addButton: Locator;
  readonly recordsFound: Locator;
  readonly searchInput: CandidatesSearchForm;
  readonly candidatesTable: CandidatesTable;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Candidates' });
    this.addButton = page.locator('.orangehrm-header-container').getByRole('button', { name: 'Add' });
    this.recordsFound = page.locator('.orangehrm-horizontal-padding').getByText(/No Records Found|\(\d+\) Records? Found/);
    this.searchInput = new CandidatesSearchForm(page);
    this.candidatesTable = new CandidatesTable(page);
  }

  async open(): Promise<void> {
    const listed = this.page.waitForResponse(
      (response) =>
        response.url().includes(urls.candidates) &&
        response.url().includes('model=list') &&
        response.ok(),
    );
    await this.page.goto(routes.candidates);
    await listed;
    await expect(this.pageTitle).toBeVisible();
  }

  async recordCount(): Promise<number> {
    const text = (await this.recordsFound.innerText()).trim();
    if (text === 'No Records Found') return 0;
    const match = text.match(/\((\d+)\)/);
    if (!match) throw new Error(`Unexpected records label: ${JSON.stringify(text)}`);
    return Number(match[1]);
  }

  async applyFilters(filters: CandidateFilters): Promise<void> {
    if (filters.jobTitle) {
      await this.searchInput.selectJobTitle(filters.jobTitle);
    }
    if (filters.vacancy) {
      await this.searchInput.selectVacancy(filters.vacancy);
    }
    if (filters.hiringManager) {
      await this.searchInput.selectHiringManager(filters.hiringManager);
    }
    if (filters.status) {
      await this.searchInput.selectStatus(filters.status);
    }
    if (filters.candidateName) {
      await this.searchInput.selectCandidate(filters.candidateName);
    }
    if (filters.keywords) {
      await this.searchInput.fillKeywords(filters.keywords);
    }
    if (filters.applicationFrom && filters.applicationTo) {
      await this.searchInput.fillApplicationDates(filters.applicationFrom, filters.applicationTo);
    }
    if (filters.method) {
      await this.searchInput.selectMethod(filters.method);
    }

    await this.searchInput.submit();
  }
}
