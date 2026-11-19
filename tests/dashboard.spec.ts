import { test } from '../fixtures';
import { expect } from '@playwright/test';

test('Show the dashboard for the signed-in role', async ({ dashboardPage, role }) => {
  await dashboardPage.open();
  await dashboardPage.expectViewFor(role);
});
