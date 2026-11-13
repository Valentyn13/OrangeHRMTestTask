import { Locator, Page } from "@playwright/test";
import { SystemUser } from "../../utils/types";

export class SystemUsersTable {
    readonly table: Locator;
  
    constructor(private readonly page: Page) {
      this.table = page.getByRole('table');
    }
  
    row(user: SystemUser): Locator {
      return this.table
        .getByRole('row')
        .filter({ has: this.cell(1, user.username) })
        .filter({ has: this.cell(2, user.userRole) })
        .filter({ has: this.cell(3, user.employeeName) })
        .filter({ has: this.cell(4, user.status) });
    }
  
    editButton(user: SystemUser): Locator {
      return this.row(user).locator('button:has(.bi-pencil-fill)');
    }
  
    deleteButton(user: SystemUser): Locator {
      return this.row(user).locator('button:has(.bi-trash)');
    }
  
    private cell(index: number, value: string): Locator {
      return this.page.locator('.oxd-table-cell').nth(index).getByText(value, { exact: true });
    }
  }
  