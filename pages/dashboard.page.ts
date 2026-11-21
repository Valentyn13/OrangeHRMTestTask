import { expect, type Locator, type Page } from '@playwright/test';
import { Role } from '../utils/types';
import { pageHref, routes } from '../utils/routes';

type MenuItem = {
  name: string;
  href: string;
};

const sharedMenus = [
  { name: 'Leave', href: 'leave/viewLeaveModule' },
  { name: 'Time', href: 'time/viewTimeModule' },
  { name: 'My Info', href: 'pim/viewMyDetails' },
  { name: 'Performance', href: 'performance/viewPerformanceModule' },
  { name: 'Dashboard', href: 'dashboard/index' },
  { name: 'Directory', href: 'directory/viewDirectory' },
  { name: 'Claim', href: 'claim/viewClaimModule' },
  { name: 'Buzz', href: 'buzz/viewBuzz' },
] as const satisfies readonly MenuItem[];

const adminOnlyMenus = [
  { name: 'Admin', href: 'admin/viewAdminModule' },
  { name: 'PIM', href: 'pim/viewPimModule' },
  { name: 'Recruitment', href: 'recruitment/viewRecruitmentModule' },
  { name: 'Maintenance', href: 'maintenance/viewMaintenanceModule' },
] as const satisfies readonly MenuItem[];

const sharedWidgets = [
  'Time at Work',
  'My Actions',
  'Quick Launch',
  'Buzz Latest Posts',
  'Employees on Leave Today',
] as const;

export const adminOnlyWidgets = [
  'Employee Distribution by Sub Unit',
  'Employee Distribution by Location',
] as const;

export type AdminChartWidget = (typeof adminOnlyWidgets)[number];

const sharedQuickLaunch = ['Apply Leave', 'My Leave', 'My Timesheet'] as const;

const adminOnlyQuickLaunch = ['Assign Leave', 'Leave List', 'Timesheets'] as const;

type DashboardView = {
  menus: readonly MenuItem[];
  hiddenMenus: readonly MenuItem[];
  widgets: readonly string[];
  hiddenWidgets: readonly string[];
  quickLaunch: readonly string[];
  hiddenQuickLaunch: readonly string[];
};

const adminView = {
  menus: [...adminOnlyMenus, ...sharedMenus],
  hiddenMenus: [],
  widgets: [...sharedWidgets, ...adminOnlyWidgets],
  hiddenWidgets: [],
  quickLaunch: [...adminOnlyQuickLaunch, ...sharedQuickLaunch],
  hiddenQuickLaunch: [],
} as const satisfies DashboardView;

const essView = {
  menus: [...sharedMenus],
  hiddenMenus: [...adminOnlyMenus],
  widgets: [...sharedWidgets],
  hiddenWidgets: [...adminOnlyWidgets],
  quickLaunch: [...sharedQuickLaunch],
  hiddenQuickLaunch: [...adminOnlyQuickLaunch],
} as const satisfies DashboardView;

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;

  }

  menu(item: MenuItem): Locator {
    return this.page.locator(`a.oxd-main-menu-item[href="${pageHref(item.href)}"]`);
  }

  widget(name: string): Locator {
    return this.page.locator('.orangehrm-dashboard-widget-name', { hasText: name });
  }

  quickLaunch(name: string): Locator {
    return this.page.locator('.orangehrm-quick-launch-heading', { hasText: name });
  }


  async open(): Promise<void> {
    await this.page.goto(routes.dashboard);
  }

  async expectViewFor(role: Role): Promise<void> {
    if (role === 'admin') {
      await this.expectView(adminView);
      return;
    }

    if (role === 'ess') {
      await this.expectView(essView);
      return;
    }
  }

  private async expectVisible(target: Locator): Promise<void> {
    await expect(target).toBeVisible();
    await target.scrollIntoViewIfNeeded();
  }

  private async expectView(view: DashboardView): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${routes.dashboard}$`));

    for (const item of view.menus) {
      await this.expectVisible(this.menu(item));
    }
    for (const item of view.hiddenMenus) {
      await expect(this.menu(item)).toHaveCount(0);
    }
    for (const name of view.widgets) {
      await this.expectVisible(this.widget(name));
    }
    for (const name of view.hiddenWidgets) {
      await expect(this.widget(name)).toHaveCount(0);
    }
    for (const name of view.quickLaunch) {
      await this.expectVisible(this.quickLaunch(name));
    }
    for (const name of view.hiddenQuickLaunch) {
      await expect(this.quickLaunch(name)).toHaveCount(0);
    }
  }
}
