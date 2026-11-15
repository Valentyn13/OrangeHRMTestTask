import  {testSetupFixture} from './tests-setup.fixture';
import { pageObjectFixture } from './page-objec.fixture';
import { mergeTests } from '@playwright/test';

// merge the two fixtures
export const test = mergeTests(testSetupFixture, pageObjectFixture);