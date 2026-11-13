import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { RoleOptions } from './utils/types';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const baseURL = process.env.BASE_URL ?? 'https://opensource-demo.orangehrmlive.com';

const authFile = (role: 'admin' | 'ess') =>
  path.join(__dirname, 'playwright', '.auth', `${role}.json`);

export default defineConfig<RoleOptions>({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 90_000,
  expect: { timeout: 60_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'login',
      testMatch: /login\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'admin',
      dependencies: ['setup'],
      testIgnore: /login\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile('admin'),
        role: 'admin',
      },
    },
    // ESS is paused for now. Uncomment to run the ess project again.
    // {
    //   name: 'ess',
    //   dependencies: ['setup'],
    //   testIgnore: /login\.spec\.ts/,
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     storageState: authFile('ess'),
    //     role: 'ess',
    //   },
    // },
  ],
});
