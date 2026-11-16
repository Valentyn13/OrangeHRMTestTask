import  {testSetupFixture} from './tests-setup.fixture';
import { pageObjectFixture } from './page-object.fixture';
import { mergeTests } from '@playwright/test';

// merge the two fixtures
export const test = mergeTests(testSetupFixture, pageObjectFixture);