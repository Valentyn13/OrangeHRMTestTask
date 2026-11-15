import { expect, type Locator, type Page, type Response } from '@playwright/test';
import type { ApplicationMethod, CandidateStatus } from '../../utils/types';

export class CandidatesSearchForm {
  readonly form: Locator;
  readonly jobTitle: Locator;
  readonly vacancy: Locator;
  readonly hiringManager: Locator;
  readonly status: Locator;
  readonly candidateName: Locator;
  readonly keywords: Locator;
  readonly applicationFrom: Locator;
  readonly applicationTo: Locator;
  readonly method: Locator;
  readonly search: Locator;
  readonly reset: Locator;

  constructor(private readonly page: Page) {
    this.form = page.locator('form.oxd-form');
    this.jobTitle = this.field('Job Title').locator('.oxd-select-text');
    this.vacancy = this.field('Vacancy').locator('.oxd-select-text');
    this.hiringManager = this.field('Hiring Manager').locator('.oxd-select-text');
    this.status = this.field('Status').locator('.oxd-select-text');
    this.candidateName = this.field('Candidate Name').getByPlaceholder('Type for hints...');
    this.keywords = this.field('Keywords').locator('input');
    this.applicationFrom = this.form.getByPlaceholder('From');
    this.applicationTo = this.form.getByPlaceholder('To');
    this.method = this.field('Method of Application').locator('.oxd-select-text');
    this.search = this.form.getByRole('button', { name: 'Search' });
    this.reset = this.form.getByRole('button', { name: 'Reset' });
  }

  async selectJobTitle(jobTitle: string): Promise<void> {
    await this.select(this.jobTitle, jobTitle);
  }

  async selectVacancy(vacancy: string): Promise<void> {
    await this.select(this.vacancy, vacancy);
  }

  async selectHiringManager(hiringManager: string): Promise<void> {
    await this.select(this.hiringManager, hiringManager);
  }

  async selectStatus(status: CandidateStatus): Promise<void> {
    await this.select(this.status, status);
  }

  async selectCandidate(name: string): Promise<void> {
    await this.candidateName.click();
    await this.candidateName.fill('');
    await this.candidateName.pressSequentially(name, { delay: 40 });
    await this.page
      .locator('.oxd-autocomplete-option')
      .filter({ hasNotText: 'Searching' })
      .filter({ hasNotText: 'No Records Found' })
      .filter({ hasText: name })
      .first()
      .click();
  }

  async fillKeywords(keywords: string): Promise<void> {
    await this.keywords.fill(keywords);
  }

  // Date inputs are yyyy-dd-mm. From has to be strictly earlier than To.
  async fillApplicationDates(from: string, to: string): Promise<void> {
    await this.applicationFrom.fill(from);
    await this.applicationTo.fill(to);
    await this.page.keyboard.press('Escape');
  }

  async selectMethod(method: ApplicationMethod): Promise<void> {
    await this.select(this.method, method);
  }

  async submit(): Promise<void> {
    const results = this.listResponse(Date.now());
    await this.search.click();
    await this.expectListed(await results);
  }

  async clear(): Promise<void> {
    const results = this.listResponse(Date.now());
    await this.reset.click();
    await this.expectListed(await results);
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

  private listResponse(since: number) {
    return this.page.waitForResponse((response) => {
      if (!response.url().includes('/api/v2/recruitment/candidates') || !response.url().includes('model=list')) {
        return false;
      }
      return response.request().timing().startTime >= since;
    });
  }

  private async expectListed(response: Response): Promise<void> {
    const body = (await response.json()) as { meta?: { total?: number } };
    const total = body.meta?.total ?? 0;
    const records = this.page.locator('.orangehrm-horizontal-padding .oxd-text--span');
    if (total === 0) {
      await expect(records).toHaveText('No Records Found');
    } else {
      await expect(records).toContainText(`(${total})`);
    }
  }
}
