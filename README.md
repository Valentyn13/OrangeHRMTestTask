# OrangeHRM Playwright tests

End-to-end tests for the public [OrangeHRM demo](https://opensource-demo.orangehrmlive.com).

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
