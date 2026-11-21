# Change requests

Review of the Playwright suite against the public OrangeHRM demo. Coverage ideas already listed in the README (ESS, employee UI, forgot-password, charts) are not repeated here.

Land them in this order: types (`CR-01`), fixtures (`CR-03`, `CR-04`), page objects (`CR-05`,`CR-08`), specs (`CR-10`), config (`CR-11`), cleanup (`CR-14`).

---

## CR-01 — `employeeId` means two different things

`NewEmployee.employeeId` is the display id (`string`). `NewVacancy.employeeId` is the hiring manager's internal `empNumber` (`number`). `createVacancy` forwards that number as the API's `employeeId`. The next call site will pass the wrong one.

`New*` is also both the create payload and the created record. `empNumber` / `id` are optional, so every teardown has a `== null` branch that skips cleanup.

**Fix:** split input from created, and name the hiring manager field what it is. Map it back to the API name in `createVacancy` only.

```ts
export type EmployeeInput = {
  firstName: string;
  lastName: string;
  employeeId: string;
};

export type Employee = EmployeeInput & {
  empNumber: number;
  fullName: string;
};

export type VacancyInput = {
  name: string;
  jobTitleId: number;
  hiringManagerEmpNumber: number;
  numOfPositions: number | null;
  description: string;
  isOpen: boolean;
  isPublished: boolean;
};

export type Vacancy = VacancyInput & {
  id: number;
  jobTitle: string;
  hiringManager: string;
};
```

Do the same for user and candidate: `UserInput` / `User` (`id` required), `CandidateInput` / `Candidate` (`id` required). Rename vacancy `status: boolean` to `isOpen`. `UserStatus` (`'Enabled' | 'Disabled'`) and `CandidateStatus` stay strings.

`createEmployee` / `createUser` / `createVacancy` / `createCandidate` return the created type, so `empNumber` and `id` are not optional. Delete the `== null` early returns in `fixtures/tests-setup.fixture.ts`. Those returns skip teardown and leak rows.

Keep `userIdsByEmployee` in the employee teardown. `tests/user-operations.spec.ts` creates the user through the UI, not through `createdUser`, and that lookup is what deletes it.

---



## CR-03 — Vacancy fixture borrows a shared employee

```80:97:fixtures/tests-setup.fixture.ts
  createdVacancies: [async ({ apiContext, vacancyCount }, use) => {
    const jobTitleId = await firstJobTitleId(apiContext);
    const employeeId = await firstEmployeeNumber(apiContext);
    // ...
  }, { scope: 'worker' }],
```

`GET /pim/employees?limit=1` is not a stable hiring manager. A parallel worker's `createdEmployee` can be that row, and its teardown deletes the manager out from under the vacancy.

`firstJobTitleId` can stay. Nothing in this suite deletes job titles.

**Fix:** create the manager inside the worker fixture and delete it after the vacancies. Delete vacancies first; they reference the manager.

```ts
createdVacancies: [async ({ apiContext, vacancyCount }, use) => {
  const jobTitleId = await firstJobTitleId(apiContext);
  const manager = await createEmployee(apiContext, disposableEmployee());
  const vacancies: Vacancy[] = [];
  try {
    for (let index = 0; index < vacancyCount; index++) {
      vacancies.push(await createVacancy(
        apiContext,
        disposableVacancy(jobTitleId, manager.empNumber, index),
      ));
    }
    await use(vacancies);
  } finally {
    await deleteVacancies(apiContext, vacancies.map((vacancy) => vacancy.id));
    await deleteEmployees(apiContext, [manager.empNumber]);
  }
}, { scope: 'worker' }],
```

`vacancyCount` is worker-scoped. `candidateCount` is test-scoped. `test.use({ vacancyCount: 2 })` in two files that share a worker throws, because a worker cannot change a worker-scoped option mid-run. Set `vacancyCount` once per file (top-level `test.use`) or in the project config. Fix the README line that says either count can be overridden the same way.

Employee and user teardowns are not in `finally`. If `userIdsByEmployee` throws, `deleteEmployees` never runs. Vacancies already use `finally`. Match that:

```ts
createdEmployee: async ({ apiContext }, use) => {
  const employee = await createEmployee(apiContext, disposableEmployee());
  try {
    await use(employee);
  } finally {
    const userIds = await userIdsByEmployee(apiContext, employee.empNumber).catch(() => []);
    await deleteUsers(apiContext, userIds);
    await deleteEmployees(apiContext, [employee.empNumber]);
  }
},
```

The `.catch(() => [])` is there so a failed user lookup still deletes the employee. `createdUser` should always `deleteUsers` with the required `id`, no `!= null` check.

---

## CR-04 — Attachments hit the shared admin profile

`tests/my-info-attachments.spec.ts` uploads `test_image.png` onto whoever `storageState` is. That is the demo admin. A failed step before "Delete the attachment" leaves the file there. A second attachment spec in parallel writes the same file name onto the same person.

`MyInfoPage.addButton` is also the first `Add` on the page, not the one in the attachment section. The other controls are scoped to `.orangehrm-attachment`. This one is not.

**Fix:**

```ts
// utils/routes.ts
employeeDetails: (empNumber: number) =>
  `/web/index.php/pim/viewPersonalDetails/empNumber/${empNumber}`,
```

```ts
async openEmployee(empNumber: number): Promise<void> {
  await this.page.goto(routes.employeeDetails(empNumber));
}

// constructor
this.addButton = this.section.getByRole('button', { name: 'Add' });
```

Drive the spec with `createdEmployee`. Admin can open that employee's PIM page. Wrap the body so delete runs when an earlier step throws:

```ts
test('creates, downloads, and deletes an attachment', async ({ myInfoPage, createdEmployee }) => {
  const comment = `comment${Date.now().toString(36)}`;
  const attachment = { fileName, comment };

  await myInfoPage.openEmployee(createdEmployee.empNumber);
  try {
    await myInfoPage.addButton.click();
    await myInfoPage.uploadFileAndComment(filePath, comment);
    // download + byte compare
  } finally {
    if (await myInfoPage.row(attachment).count()) {
      await myInfoPage.deleteAttachment(attachment);
    }
  }
});
```

Replace the `toPass` loop (`timeout: 1_000` inside a retry-until-test-timeout) with one wait. `scrollIntoViewIfNeeded` already waits for the row to be attached:

```ts
const row = myInfoPage.row(attachment);
await row.scrollIntoViewIfNeeded();
await expect(row).toBeVisible();
```

---

## CR-05 — Searches and deletes don't wait for the request that updates the table

`SystemUsersPage.searchByUsername` fills and clicks. The spec then asserts the row. The assertion retries against whatever is already in the DOM. It does not retry the search.

The delete spec clicks `Yes, Delete` and searches immediately. If the GET lands before the DELETE, the user comes back and `toHaveCount(0)` sits on that result until the expect timeout (60s).

Candidate search has the opposite problem: it waits, then asserts inside the page, twice.

```77:87:pages/components/candidates-search-form.ts
  async submit(): Promise<void> {
    const results = this.listResponse(Date.now());
    await this.search.click();
    await this.expectListed(await results);
  }
```

`expectListed` is a private copy of `CandidatesPage.expectRecordCount`. `listResponse` also filters on `request.timing().startTime`. The listener is already armed before the click, so the timing check is redundant, and `timing()` is not reliably populated when the predicate runs.

`CandidatesPage.open` asserts the demo-wide total from that response. Every filter test inherits that assertion. It is not what those tests are about, and the locator `.orangehrm-horizontal-padding .oxd-text--span` is wide enough to go strict-mode if a second span shows up.

**Fix:**

- `searchByUsername` registers `waitForResponse` for `GET /api/v2/admin/users` before the click, then awaits it.
- Delete waits for `DELETE /api/v2/admin/users` and `res.ok()` before searching again. Put that wait next to `confirmDelete`, not inline in the spec.
- `submit` / `clear` return the list total (or return `void`) and do not assert. Drop `listResponse`'s `timing()` filter. Keep arming `waitForResponse` before the click.
- `open()` waits for the list response, then asserts `pageTitle`. It does not assert the global count.
- `recordCount` throws on unexpected text instead of returning `0`:

```ts
async recordCount(): Promise<number> {
  const text = (await this.recordsFound.innerText()).trim();
  if (text === 'No Records Found') return 0;
  const match = text.match(/\((\d+)\)/);
  if (!match) throw new Error(`Unexpected records label: ${JSON.stringify(text)}`);
  return Number(match[1]);
}
```

Scope `recordsFound` to the records label (`getByText(/Records Found|No Records Found/)`) instead of every span in `.orangehrm-horizontal-padding`.

`EditUserPage.update` uses `expect()` for the validation and PUT responses. A non-OK response should `throw new Error(...)` with status and body (same shape as `readOk`). The spec asserts the URL and the row. Delete the comments that restate the next line.

---

## CR-08 — Table locators

`CandidatesTable.rows` is `page.locator('.oxd-table-body')`, while `header()` is scoped to `this.table`. A second table on the page mixes into `columnTexts`.

```ts
this.rows = this.table.locator('.oxd-table-body').getByRole('row');
```

`SystemUsersTable.cell` is `page.locator('.oxd-table-cell').nth(index)`. That is correct only because `filter({ has })` re-runs the inner selector from the row. Chaining the cell off `this.table` or off the row and passing that to `has` looks cleaner and matches nothing: the inner selector would look for a table inside the row.

Keep the inner locator relative (`page.locator('[role="cell"]').nth(...)`). Name the indexes the way `candidateColumns` already does, including the checkbox at 0:

```ts
export const systemUserColumns = {
  username: 1,
  userRole: 2,
  employeeName: 3,
  status: 4,
} as const;
```

Add a one-line comment on `cell()`: the locator passed to `has` must stay relative to the row.
---

## CR-10 — Auth files and `baseURL` are defined twice

`playwright.config.ts` builds the storage path from `__dirname`. `config/env.ts` builds it from `process.cwd()`. Run the suite from another directory and setup writes a file the project config does not read.

`baseURL` is resolved in the config and again at import time in `utils/api.ts`. Credentials throw when `.env` is missing. `BASE_URL` silently falls through to the public demo.

**Fix:** one root, next to the config file, and read env inside the function that uses it.

```ts
const root = path.resolve(__dirname, '..');

export function authStatePath(role: AuthRole): string {
  return path.join(root, 'playwright', '.auth', `${role}.json`);
}

export function baseUrl(): string {
  const url = process.env.BASE_URL;
  if (!url) throw new Error('Missing BASE_URL. Copy .env.example to .env.');
  return url;
}
```

`playwright.config.ts` uses `authStatePath('admin')` and `baseUrl()`. Delete the local `authFile`. `createApiContext` calls `baseUrl()` in the function body, not from a module-level `const`.

Move `ensureAuthDir()` from the top of `tests/auth.setup.ts` into the setup test. Importing the file should not mkdir.

---

## CR-11 — Failure config records nothing

```16:26:playwright.config.ts
  retries: 0,
  workers: 4,
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
```

`trace: 'on-first-retry'` with `retries: 0` never writes a trace. `expect.timeout` of 60s inside a 90s test means the first bad locator burns the test before the second assertion runs. A slow demo is a reason to raise `navigationTimeout` on `goto`, not every `expect`.

```ts
retries: process.env.CI ? 2 : 0,
forbidOnly: !!process.env.CI,
timeout: 60_000,
expect: { timeout: 10_000 },
use: {
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  actionTimeout: 15_000,
  navigationTimeout: 30_000,
},
```

If a specific navigation on the demo is slower than 30s, pass the longer timeout on that `goto`. Don't put it back on the global expect.

`readOk` returns text and callers `JSON.parse` it. A 200 with an HTML body throws `SyntaxError` and drops the label. Parse in one place:

```ts
function readJson<T>(body: string, label: string): T {
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`${label} returned non-JSON: ${body.slice(0, 500)}`);
  }
}
```

---

## CR-14 — README setup is wrong in three places

- Setup steps never run `npm ci`. Install order is `npm ci`, then `npx playwright install`, then `cp .env.example .env`.
- `test.use({ vacancyCount, candidateCount })` is not true for both. See CR-03.
- "The CI/CD do not runs because I somehow owed GitHub some money" is a personal note in the setup doc. One sentence is enough: CI is disabled until GitHub billing is fixed. The workflow file itself is fine.

---

## Not bugs

- `auth.setup.ts` is excluded from the `admin` project by Playwright's default `testMatch` (`*.spec.ts` / `*.test.ts`). Don't add a second ignore unless the file is renamed to `*.spec.ts`. If you rename it, set `testMatch: /.*\.spec\.ts/` on `admin` or the login setup runs again inside the admin project and rewrites the cookie mid-suite.
- `filter({ has })` re-roots the inner selector. `SystemUsersTable.cell` works for a multi-row table because of that. See CR-08 before changing it.
- `createdUser` deleting the user and `createdEmployee` deleting users by `empNumber` is redundant on purpose. The UI-created user has no `createdUser` fixture.
- `delete*` accepting 404 is correct. Teardown must tolerate a spec that already deleted the row.
