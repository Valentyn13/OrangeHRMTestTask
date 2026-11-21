import { expect, type Locator, type Page } from '@playwright/test';

export const vacancyColumns = {
  vacancy: 1,
  jobTitle: 2,
  hiringManager: 3,
  status: 4,
} as const;

export type VacancyColumn = (typeof vacancyColumns)[keyof typeof vacancyColumns];

export class VacanciesTable {
  readonly table: Locator;
  readonly rows: Locator;

  constructor(private readonly page: Page) {
    this.table = page.getByRole('table');
    this.rows = this.table.locator('.oxd-table-body').getByRole('row');
  }

  header(name: string): Locator {
    return this.table.getByRole('columnheader', { name });
  }

  async columnTexts(column: VacancyColumn): Promise<string[]> {
    return this.rows.evaluateAll((rows, index) => {
      return rows.map((row) => {
        const cell = row.querySelectorAll(':scope > [role="cell"]')[index];
        return (cell?.textContent ?? '').replace(/\s+/g, ' ').trim();
      });
    }, column);
  }

  async expectColumn(column: VacancyColumn, value: string): Promise<void> {
    const values = await this.columnTexts(column);
    expect(values.length).toBeGreaterThan(0);
    for (const cell of values) {
      expect(cell).toBe(value);
    }
  }
}
