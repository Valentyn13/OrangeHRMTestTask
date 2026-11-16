import { expect, type Locator, type Page } from '@playwright/test';

export const candidateColumns = {
  vacancy: 1,
  candidate: 2,
  hiringManager: 3,
  dateOfApplication: 4,
  status: 5,
} as const;

export type CandidateColumn = (typeof candidateColumns)[keyof typeof candidateColumns];

function applicationTime(value: string): number {
  const [year, day, month] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export class CandidatesTable {
  readonly table: Locator;
  readonly rows: Locator;

  constructor(private readonly page: Page) {
    this.table = page.getByRole('table');
    this.rows = page.locator('.oxd-table-body').getByRole('row');
  }

  header(name: string): Locator {
    return this.table.getByRole('columnheader', { name });
  }

  rowByCandidate(name: string): Locator {
    return this.rows.filter({
      has: this.page.getByRole('cell', { name, exact: true }),
    });
  }

  viewButton(name: string): Locator {
    return this.rowByCandidate(name).locator('button:has(.bi-eye-fill)');
  }

  deleteButton(name: string): Locator {
    return this.rowByCandidate(name).locator('button:has(.bi-trash)');
  }

  async columnTexts(column: CandidateColumn): Promise<string[]> {
    return this.rows.evaluateAll((rows, index) => {
      return rows.map((row) => {
        const cell = row.querySelectorAll(':scope > [role="cell"]')[index];
        return (cell?.textContent ?? '').replace(/\s+/g, ' ').trim();
      });
    }, column);
  }

  async expectColumn(column: CandidateColumn, value: string): Promise<void> {
    const values = await this.columnTexts(column);
    expect(values.length).toBeGreaterThan(0);
    for (const cell of values) {
      expect(cell).toBe(value);
    }
  }

  async expectApplicationDatesBetween(from: string, to: string): Promise<void> {
    const dates = await this.columnTexts(candidateColumns.dateOfApplication);
    expect(dates.length).toBeGreaterThan(0);
    const start = applicationTime(from);
    const end = applicationTime(to);
    for (const date of dates) {
      const value = applicationTime(date);
      expect(value).toBeGreaterThanOrEqual(start);
      expect(value).toBeLessThanOrEqual(end);
    }
  }
}
