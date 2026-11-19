import { Locator, Page } from "@playwright/test";
import { SystemUser } from "../../utils/types";

export const systemUserColumns = {
  username: 1,
  userRole: 2,
  employeeName: 3,
  status: 4,
} as const;

export class SystemUsersTable {
    readonly table: Locator;
  
    constructor(private readonly page: Page) {
      this.table = page.getByRole('table');
    }
  
    row(user: SystemUser): Locator {
      return this.table
        .getByRole('row')
        .filter({ has: this.cell(systemUserColumns.username, user.username) })
        .filter({ has: this.cell(systemUserColumns.userRole, user.userRole) })
        .filter({ has: this.cell(systemUserColumns.employeeName, user.employeeName) })
        .filter({ has: this.cell(systemUserColumns.status, user.status) });
    }
  
    editButton(user: SystemUser): Locator {
      return this.row(user).locator('button:has(.bi-pencil-fill)');
    }
  
    deleteButton(user: SystemUser): Locator {
      return this.row(user).locator('button:has(.bi-trash)');
    }
  
    // Locator passed to `has` must stay relative to the row.
    private cell(index: number, value: string): Locator {
      return this.page.locator('[role="cell"]').nth(index).getByText(value, { exact: true });
    }
  }
  