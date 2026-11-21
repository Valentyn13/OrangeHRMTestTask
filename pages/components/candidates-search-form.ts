import { type Locator, type Page } from '@playwright/test';
import { urls } from '../../utils/routes';
import type { ApplicationMethod, CandidateStatus } from '../../utils/types';

export class CandidatesSearchForm {
  readonly form: Locator;
  readonly jobTitle: Locator;
  readonly vacancyInput: Locator;
  readonly hiringManagerInput: Locator;
  readonly status: Locator;
  readonly candidateNameInput: Locator;
  readonly keywordsInput: Locator;
  readonly applicationFromInput: Locator;
  readonly applicationToInput: Locator;
  readonly method: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;

  constructor(private readonly page: Page) {
    this.form = page.locator('form.oxd-form');
    this.jobTitle = this.field('Job Title').locator('.oxd-select-text');
    this.vacancyInput = this.field('Vacancy').locator('.oxd-select-text');
    this.hiringManagerInput = this.field('Hiring Manager').locator('.oxd-select-text');
    this.status = this.field('Status').locator('.oxd-select-text');
    this.candidateNameInput = this.field('Candidate Name').getByPlaceholder('Type for hints...');
    this.keywordsInput = this.field('Keywords').locator('input');
    this.applicationFromInput = this.form.getByPlaceholder('From');
    this.applicationToInput = this.form.getByPlaceholder('To');
    this.method = this.field('Method of Application').locator('.oxd-select-text');
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

  async selectStatus(status: CandidateStatus): Promise<void> {
    await this.select(this.status, status);
  }

  async selectCandidate(name: string): Promise<void> {
    await this.candidateNameInput.click();
    await this.candidateNameInput.fill('');
    await this.candidateNameInput.pressSequentially(name, { delay: 40 });
    await this.page
      .locator('.oxd-autocomplete-option')
      .filter({ hasNotText: 'Searching' })
      .filter({ hasNotText: 'No Records Found' })
      .filter({ hasText: name })
      .first()
      .click();
  }

  async fillKeywords(keywords: string): Promise<void> {
    await this.keywordsInput.fill(keywords);
  }

  // Date inputs are yyyy-dd-mm. From has to be strictly earlier than To.
  async fillApplicationDates(from: string, to: string): Promise<void> {
    await this.applicationFromInput.fill(from);
    await this.applicationToInput.fill(to);
    await this.page.keyboard.press('Escape');
  }

  async selectMethod(method: ApplicationMethod): Promise<void> {
    await this.select(this.method, method);
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
      response.url().includes(urls.candidates) &&
      response.url().includes('model=list'),
    );
  }
}
