import { expect, type Locator, type Page } from '@playwright/test';
import type { VacancyFilters } from '../utils/types';
import { routes, urls } from '../utils/routes';
import { VacanciesSearchForm } from './components/vacancies-search-form';
import { VacanciesTable } from './components/vacancies-table';

export class VacanciesPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly recordsFound: Locator;
  readonly searchInput: VacanciesSearchForm;
  readonly vacanciesTable: VacanciesTable;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Vacancies' });
    this.recordsFound = page.locator('.orangehrm-horizontal-padding').getByText(/No Records Found|\(\d+\) Records? Found/);
    this.searchInput = new VacanciesSearchForm(page);
    this.vacanciesTable = new VacanciesTable(page);
  }

  async open(): Promise<void> {
    const listed = this.page.waitForResponse(
      (response) =>
        response.url().includes(urls.vacancies) &&
        response.url().includes('model=detailed') &&
        response.ok(),
    );
    await this.page.goto(routes.jobVacancies);
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

  async applyFilters(filters: VacancyFilters): Promise<void> {
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

    await this.searchInput.submit();
  }
}
