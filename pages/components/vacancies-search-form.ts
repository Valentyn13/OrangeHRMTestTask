import { type Locator, type Page } from '@playwright/test';
import { urls } from '../../utils/routes';
import type { VacancyStatus } from '../../utils/types';

export class VacanciesSearchForm {
  readonly form: Locator;
  readonly jobTitle: Locator;
  readonly vacancyInput: Locator;
  readonly hiringManagerInput: Locator;
  readonly status: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;

  constructor(private readonly page: Page) {
    this.form = page.locator('form.oxd-form');
    this.jobTitle = this.field('Job Title').locator('.oxd-select-text');
    this.vacancyInput = this.field('Vacancy').locator('.oxd-select-text');
    this.hiringManagerInput = this.field('Hiring Manager').locator('.oxd-select-text');
    this.status = this.field('Status').locator('.oxd-select-text');
    this.searchButton = this.form.getByRole('button', { name: 'Search' });
    this.resetButton = this.form.getByRole('button', { name: 'Reset' });
  }

  async selectJobTitle(jobTitle: string): Promise<void> {
    await this.select(this.jobTitle, jobTitle);
  }

  async selectVacancy(vacancy: string): Promise<void> {
    await this.select(this.vacancyInput, vacancy);
  }

  async selectHiringManager(hiringManager: string): Promise<void> {
    await this.select(this.hiringManagerInput, hiringManager);
  }

  async selectStatus(status: VacancyStatus): Promise<void> {
    await this.select(this.status, status);
  }

  async submit(): Promise<void> {
    const results = this.listResponse();
    await this.searchButton.click();
    await results;
  }

  async clear(): Promise<void> {
    const results = this.listResponse();
    await this.resetButton.click();
    await results;
  }

  private field(label: string): Locator {
    return this.form.locator('.oxd-input-group').filter({
      has: this.page.locator('label', { hasText: new RegExp(`^${label}$`) }),
    });
  }

  private async select(dropdown: Locator, option: string): Promise<void> {
    await dropdown.click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }

  private listResponse() {
    return this.page.waitForResponse((response) =>
      response.ok() &&
      response.url().includes(urls.vacancies) &&
      response.url().includes('model=detailed'),
    );
  }
}
