const { expect } = require('@playwright/test');

expect.extend({
  async toHaveCountGreaterThan(locator, n) {
    const count = await locator.count();
    const pass = count > n;
    return {
      pass,
      message: () => `Expected locator count > ${n}, received ${count}`
    };
  }
});