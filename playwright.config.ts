import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { authStatePath, baseUrl } from './config/env';
import { RoleOptions } from './utils/types';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig<RoleOptions>({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  workers: 4,
  reporter: 'html',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: baseUrl(),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
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
        storageState: authStatePath('admin'),
        role: 'admin',
      },
    },
    // ESS role disabled because of environment reset.
    // {
    //   name: 'ess',
    //   dependencies: ['setup'],
    //   testIgnore: /login\.spec\.ts/,
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     storageState: authStatePath('ess'),
    //     role: 'ess',
    //   },
    // },
  ],
});
