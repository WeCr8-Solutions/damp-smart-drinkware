import { expect, Locator } from '@playwright/test';

// Extend Playwright's builtin matchers
declare module '@playwright/test' {
  interface Matchers<R> {
    toHaveCountGreaterThan(n: number): Promise<R>;
  }
}

// Custom matcher implementation 
expect.extend({
  async toHaveCountGreaterThan(locator: Locator, n: number) {
    const count = await locator.count();
    const pass = count > n;
    return {
      pass,
      message: () => `Expected locator count > ${n}, received ${count}`,
    };
  },
});