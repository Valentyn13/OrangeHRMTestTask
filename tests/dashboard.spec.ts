import { test } from '../fixtures/test';

test('shows the dashboard for the signed-in role', async ({ dashboardPage, role }) => {
  await dashboardPage.open();
  await dashboardPage.expectViewFor(role);
});
