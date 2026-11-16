# OrangeHRM Playwright tests

End-to-end tests for the public [OrangeHRM demo](https://opensource-demo.orangehrmlive.com).

## Note:
```The CI/CD do not runs because I somehow owed GitHub some money and they want my billing information```
## Prerequisites

- Node.js LTS
- npm

## Setup

```bash
git clone <repo-url>
npx playwright install
cp .env.example .env
```


## Run

```bash
npm test                 # all projects (setup + login + admin)
npm run test:login       # login specs only
npm run test:admin       # admin specs (runs auth setup first)
npm run report           # open the last HTML report
```


## Overview

### Project features

1. Fully parallel run, 4 workers.
2. Per-test API setup and teardown in fixtures (employee, user, vacancy, candidate).
3. `auth.setup` writes browser `storageState` and the `orangehrm` cookie used by API calls.
4. Page objects injected as Playwright fixtures.
5. Parametrized fixtures and fixtures that use other fixtures.
6. Reuse login state for UI test and auth for API.

### Structure

```
playwright.config.ts          projects, timeouts, baseURL, storageState
.env.example                  BASE_URL and role credentials (copy to .env)

config/
  env.ts                      .env credential resolve, auth file paths, cookie read/write

fixtures/
  index.ts                    merged `test` — import this in specs
  page-object.fixture.ts       page object fixtures
  tests-setup.fixture.ts      worker: cookie, apiContext, createdVacancies (vacancyCount)
                              test: createdEmployee, createdUser, createdCandidates (candidateCount)

pages/
  login.page.ts               
  dashboard.page.ts
  my-info.page.ts             PIM My Info, including attachments
  employee-list.page.ts
  system-users.page.ts        Admin → User Management list
  add-user.page.ts
  edit-user.page.ts
  candidates.page.ts          Recruitment → Candidates
  components/                 Widgets owned by a page, not full screens
    add-employee.form.ts
    system-users-search-form.ts
    system-users-table.ts
    candidates-search-form.ts
    candidates-table.ts

tests/
  auth.setup.ts               login per role; writes playwright/.auth/<role>.json and .cookie
  login.spec.ts               project: login (no storageState)
  dashboard.spec.ts           project: admin
  user-operations.spec.ts
  my-info-attachments.spec.ts
  candidates.spec.ts

utils/
  api.ts                      OrangeHRM API: employees, users, vacancies, candidates
  helpers.ts                  Disposable* factories (unique names per run)
  types.ts                    Types, Role, candidate statuses
  routes.ts                   UI paths shared by pages and auth.setup
  assets/test_image.png       Attachment used by my-info specs

.github/workflows/playwright.yml   CI: npm ci, install browsers, copy .env.example, run tests
```

`playwright/.auth/` is created by `auth.setup` and gitignored. Specs import `test` from `fixtures/index.ts`, which merges page-object fixtures with the API setup fixtures. A spec that asks for `createdUser` also gets `createdEmployee` (the user is attached to that employee). `apiContext` is created once per worker from `orangehrmCookie` and reused for every API call. `createdVacancies` is worker-scoped (`vacancyCount`, default 1); `createdCandidates` is per test (`candidateCount`, default 1) and is attached to those vacancies. Candidate teardown runs after each test. Vacancy teardown runs when the worker exits. Override either count with `test.use({ vacancyCount: 2, candidateCount: 3 })`.

# IMPROVES FOR LATER

### Isolation on the shared demo

- ESS user role is not used. The demo DB resets the data, so `ESS_USERNAME` in `.env.example` not used, this can be improved and test with this role can be added.
- `createdVacancies` uses `firstEmployeeNumber()` as the hiring manager. A parallel worker can delete that employee. Create a dedicated employee inside the vacancy fixture and delete it with the vacancy.
- `tests/my-info-attachments.spec.ts` uploads onto the shared admin profile. Drive it through `createdEmployee` so a failed delete does not leave files on the demo admin, and so a second attachment spec can run in parallel.

### Coverage

- Employee create and search UI tests (`employeeListPage` and `addEmployeeForm`)
- User update not only with username: role and status, and an assertion that the old username is gone.
- Login still missing: forgot-password navigation, and a disabled user case.
