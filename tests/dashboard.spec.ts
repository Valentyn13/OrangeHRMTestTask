import { test } from '../fixtures';

test('Show the dashboard for the signed-in role', async ({ dashboardPage, role }) => {
  await dashboardPage.open();
  await dashboardPage.expectViewFor(role);
});

test('Sub unit pie chart legend removes and restores its slice', async ({ dashboardPage, role }) => {
  test.skip(role !== 'admin', 'Distribution charts are admin-only');
  await dashboardPage.open();
  await dashboardPage.expectSubUnitPieChart();
});

test('Location pie chart legend removes and restores its slice', async ({ dashboardPage, role }) => {
  test.skip(role !== 'admin', 'Distribution charts are admin-only');
  await dashboardPage.open();
  await dashboardPage.expectLocationPieChart();
});
