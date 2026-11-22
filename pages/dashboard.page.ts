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

export const employeeDistributionBySubUnitChartLegendItems = ['Engineering', 'Human Resources', 'Administration', 'Client Services', 'Unassigned'] as const;
export const employeeDistributionByLocationChartLegendItems = ['Texas R&D', 'New York Sales Office', 'Unassigned'] as const;

type Rgb = { r: number; g: number; b: number };

type Canvas2D = {
  width: number;
  height: number;
  getContext(kind: '2d'): {
    getImageData(sx: number, sy: number, sw: number, sh: number): { data: Uint8ClampedArray };
  } | null;
};

export class DashboardPage {
  readonly page: Page;
  readonly employeeDistributionContainer: Locator;
  readonly employeeDistributionByLocationContainer: Locator;
  readonly subUnitCanvas: Locator;
  readonly locationCanvas: Locator;

  constructor(page: Page) {
    this.page = page;
    this.employeeDistributionContainer = this.chartCard('Employee Distribution by Sub Unit');
    this.employeeDistributionByLocationContainer = this.chartCard('Employee Distribution by Location');
    this.subUnitCanvas = this.employeeDistributionContainer.locator('canvas');
    this.locationCanvas = this.employeeDistributionByLocationContainer.locator('canvas');
  }

  chartCard(name: AdminChartWidget): Locator {
    return this.page.locator('.oxd-sheet.orangehrm-dashboard-widget', {
      has: this.page.locator('.orangehrm-dashboard-widget-name', { hasText: name }),
    });
  }

  legendLabel(card: Locator, label: string): Locator {
    return card.locator(`ul.oxd-chart-legend span[title="${label}"]`);
  }

  async expectSubUnitPieChart(): Promise<void> {
    await this.expectPieChartToggles(
      'Employee Distribution by Sub Unit',
      this.subUnitCanvas,
      employeeDistributionBySubUnitChartLegendItems,
    );
  }

  async expectLocationPieChart(): Promise<void> {
    await this.expectPieChartToggles(
      'Employee Distribution by Location',
      this.locationCanvas,
      employeeDistributionByLocationChartLegendItems,
    );
  }

  private async expectPieChartToggles(
    name: AdminChartWidget,
    canvas: Locator,
    labels: readonly string[],
  ): Promise<void> {
    const card = this.chartCard(name);
    await this.expectVisible(card);
    await expect(canvas).toBeVisible();
    const rendered = await card.locator('ul.oxd-chart-legend span[title]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('title') ?? ''),
    );
    for (const label of labels) expect(rendered).toContain(label);

    for (const label of rendered) {
      const legend = this.legendLabel(card, label);
      const color = await this.legendColor(card, label);
      const painted = await this.settledPixelCount(canvas, color);

      await legend.click();
      await expect.poll(() => this.slicePixelCount(canvas, color)).toBe(0);
      await expect(legend).toHaveCSS('text-decoration-line', 'line-through');

      await legend.click();
      await expect.poll(() => this.slicePixelCount(canvas, color)).toBe(painted);
      await expect(legend).toHaveCSS('text-decoration-line', 'none');
    }
  }

  private async legendColor(card: Locator, label: string): Promise<Rgb> {
    const background = await card
      .locator(`ul.oxd-chart-legend li:has(span[title="${label}"]) .oxd-chart-legend-key`)
      .evaluate((node) => getComputedStyle(node).backgroundColor);
    const channels = background.match(/\d+/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length < 3) throw new Error(`Missing legend color for ${label}`);
    return { r: channels[0], g: channels[1], b: channels[2] };
  }

  // Chart is not on window. A slice is the canvas pixels that match its legend swatch.
  private slicePixelCount(canvas: Locator, color: Rgb): Promise<number> {
    return canvas.evaluate((node, color) => {
      const source = node as unknown as Canvas2D;
      const context = source.getContext('2d');
      if (!context) throw new Error('Canvas has no 2d context');
      const { data } = context.getImageData(0, 0, source.width, source.height);
      let count = 0;
      for (let offset = 0; offset < data.length; offset += 4) {
        if (data[offset + 3] < 200) continue;
        if (data[offset] === color.r && data[offset + 1] === color.g && data[offset + 2] === color.b) count++;
      }
      return count;
    }, color);
  }

  private async settledPixelCount(canvas: Locator, color: Rgb): Promise<number> {
    let settled = 0;
    await expect.poll(async () => {
      const first = await this.slicePixelCount(canvas, color);
      await this.page.waitForTimeout(200);
      const second = await this.slicePixelCount(canvas, color);
      settled = first === second ? first : 0;
      return settled;
    }).toBeGreaterThan(0);
    return settled;
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
