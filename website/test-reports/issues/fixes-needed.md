## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T19:38:42.750Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.product-grid, [data-testid="product-grid"], .products-container')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.product-grid, [data-testid="product-grid"], .products-container')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T19:39:04.041Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.product-grid, [data-testid="product-grid"], .products-container')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.product-grid, [data-testid="product-grid"], .products-container')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: invalid cart quantity is rejected
- **Time**: 2025-10-05T19:41:31.283Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:332
- **Error**: Error: locator.click: Error: strict mode violation: getByRole('link', { name: /products/i }) resolved to 2 elements:
    1) <a class="btn btn-secondary" href="pages/products.html">↵                            View All Products↵  …</a> aka getByRole('link', { name: 'View All Products' }).first()
    2) <a class="btn btn-secondary" href="pages/products.html">View All Products</a> aka locator('a').filter({ hasText: /^View All Products$/ })

Call log:
[2m  - waiting for getByRole('link', { name: /products/i })[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 332
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: invalid cart quantity is rejected
- **Time**: 2025-10-05T19:41:42.108Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:332
- **Error**: Error: locator.click: Error: strict mode violation: getByRole('link', { name: /products/i }) resolved to 2 elements:
    1) <a class="btn btn-secondary" href="pages/products.html">↵                            View All Products↵  …</a> aka getByRole('link', { name: 'View All Products' }).first()
    2) <a class="btn btn-secondary" href="pages/products.html">View All Products</a> aka locator('a').filter({ hasText: /^View All Products$/ })

Call log:
[2m  - waiting for getByRole('link', { name: /products/i })[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 332
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: checkout requires required fields
- **Time**: 2025-10-05T19:41:53.166Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:394
- **Error**: Error: locator.click: Error: strict mode violation: getByRole('link', { name: /products/i }) resolved to 2 elements:
    1) <a class="btn btn-secondary" href="pages/products.html">↵                            View All Products↵  …</a> aka getByRole('link', { name: 'View All Products' }).first()
    2) <a class="btn btn-secondary" href="pages/products.html">View All Products</a> aka locator('a').filter({ hasText: /^View All Products$/ })

Call log:
[2m  - waiting for getByRole('link', { name: /products/i })[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 394
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: checkout requires required fields
- **Time**: 2025-10-05T19:42:03.458Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:394
- **Error**: Error: locator.click: Error: strict mode violation: getByRole('link', { name: /products/i }) resolved to 2 elements:
    1) <a class="btn btn-secondary" href="pages/products.html">↵                            View All Products↵  …</a> aka getByRole('link', { name: 'View All Products' }).first()
    2) <a class="btn btn-secondary" href="pages/products.html">View All Products</a> aka locator('a').filter({ hasText: /^View All Products$/ })

Call log:
[2m  - waiting for getByRole('link', { name: /products/i })[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 394
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T19:42:23.548Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.product-grid, [data-testid="product-grid"], .products-container')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.product-grid, [data-testid="product-grid"], .products-container')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T19:42:43.229Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.product-grid, [data-testid="product-grid"], .products-container')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.product-grid, [data-testid="product-grid"], .products-container')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: mobile nav & cart drawer fits viewport
- **Time**: 2025-10-05T19:43:47.430Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:222
- **Error**: Error: locator.click: Target page, context or browser has been closed
Call log:
[2m  - waiting for getByRole('button', { name: /toggle.+navigation/i })[22m
[2m    - locator resolved to <button role="button" class="hamburger" aria-expanded="false" aria-controls="mobile-menu" data-analytics="nav-hamburger" aria-label="Toggle navigation menu">…</button>[22m
[2m  - attempting click action[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is visible, enabled and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <button class="animation-skip-button">Skip</button> from <div aria-hidden="true" role="presentation" class="hero-animation-overlay">…</div> subtree intercepts pointer events[22m
[2m    - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is visible, enabled and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <button class="animation-skip-button">Skip</button> from <div aria-hidden="true" role="presentation" class="hero-animation-overlay">…</div> subtree intercepts pointer events[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    3 × waiting for element to be visible, enabled and stable[22m
[2m      - element is visible, enabled and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <button class="animation-skip-button">Skip</button> from <div aria-hidden="true" role="presentation" class="hero-animation-overlay">…</div> subtree intercepts pointer events[22m
[2m    - retrying click action[22m
[2m      - waiting 500ms[22m
[2m    5 × waiting for element to be visible, enabled and stable[22m
[2m      - element is visible, enabled and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <div id="damp-debug-panel">…</div> intercepts pointer events[22m
[2m    - retrying click action[22m
[2m      - waiting 500ms[22m
[2m  - element was detached from the DOM, retrying[22m
[2m    - waiting for" http://localhost:3000/pages/pre-sale-funnel.html" navigation to finish...[22m
[2m    - navigated to "http://localhost:3000/pages/pre-sale-funnel.html"[22m
[2m    - waiting for" http://localhost:3000/pages/product-voting.html" navigation to finish...[22m
[2m    - navigated to "http://localhost:3000/pages/product-voting.html"[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 222
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T19:57:54.786Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.product-grid, [data-testid="product-grid"], .products-container')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.product-grid, [data-testid="product-grid"], .products-container')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T19:58:16.746Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.product-grid, [data-testid="product-grid"], .products-container')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.product-grid, [data-testid="product-grid"], .products-container')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: invalid cart quantity is rejected
- **Time**: 2025-10-05T20:00:43.429Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:397
- **Error**: Error: locator.click: Error: strict mode violation: getByRole('link', { name: /products/i }) resolved to 2 elements:
    1) <a class="btn btn-secondary" href="pages/products.html">↵                            View All Products↵  …</a> aka getByRole('link', { name: 'View All Products' }).first()
    2) <a class="btn btn-secondary" href="pages/products.html">View All Products</a> aka locator('a').filter({ hasText: /^View All Products$/ })

Call log:
[2m  - waiting for getByRole('link', { name: /products/i })[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 397
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: invalid cart quantity is rejected
- **Time**: 2025-10-05T20:00:53.444Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:397
- **Error**: Error: locator.click: Error: strict mode violation: getByRole('link', { name: /products/i }) resolved to 2 elements:
    1) <a class="btn btn-secondary" href="pages/products.html">↵                            View All Products↵  …</a> aka getByRole('link', { name: 'View All Products' }).first()
    2) <a class="btn btn-secondary" href="pages/products.html">View All Products</a> aka locator('a').filter({ hasText: /^View All Products$/ })

Call log:
[2m  - waiting for getByRole('link', { name: /products/i })[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 397
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: checkout requires required fields
- **Time**: 2025-10-05T20:01:03.000Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:459
- **Error**: Error: locator.click: Error: strict mode violation: getByRole('link', { name: /products/i }) resolved to 2 elements:
    1) <a class="btn btn-secondary" href="pages/products.html">↵                            View All Products↵  …</a> aka getByRole('link', { name: 'View All Products' }).first()
    2) <a class="btn btn-secondary" href="pages/products.html">View All Products</a> aka locator('a').filter({ hasText: /^View All Products$/ })

Call log:
[2m  - waiting for getByRole('link', { name: /products/i })[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 459
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: checkout requires required fields
- **Time**: 2025-10-05T20:01:11.678Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:459
- **Error**: Error: locator.click: Error: strict mode violation: getByRole('link', { name: /products/i }) resolved to 2 elements:
    1) <a class="btn btn-secondary" href="pages/products.html">↵                            View All Products↵  …</a> aka getByRole('link', { name: 'View All Products' }).first()
    2) <a class="btn btn-secondary" href="pages/products.html">View All Products</a> aka locator('a').filter({ hasText: /^View All Products$/ })

Call log:
[2m  - waiting for getByRole('link', { name: /products/i })[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 459
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:03:04.429Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: Could not find product grid
- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:03:15.473Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: Could not find product grid
- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:26:10.168Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:26:40.495Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:28:23.509Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:54
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 54
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:28:52.719Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:54
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 54
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:34:58.009Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:35:26.741Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:42:11.047Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:54
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 54
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:42:38.021Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:54
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 54
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:42:51.024Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:43:35.112Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:51:21.769Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:51:52.331Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:58:56.733Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:54
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 54
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:59:21.652Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:59:26.646Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:54
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 54
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T20:59:51.516Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:55
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 55
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T21:13:15.361Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:54
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 54
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T21:13:43.942Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:54
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.about-content')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.about-content')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 54
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T21:20:40.018Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts:39
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  getByRole('heading', { name: /damp smart drinkware/i })
Expected: visible
Received: <element(s) not found>
Timeout:  15000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 15000ms[22m
[2m  - waiting for getByRole('heading', { name: /damp smart drinkware/i })[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 39
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T21:21:07.255Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts:39
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  getByRole('heading', { name: /damp smart drinkware/i })
Expected: visible
Received: <element(s) not found>
Timeout:  15000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 15000ms[22m
[2m  - waiting for getByRole('heading', { name: /damp smart drinkware/i })[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 39
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts" --headed

---

## Failed Test: mobile nav & cart drawer fits viewport
- **Time**: 2025-10-05T21:21:27.839Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts:159
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.hamburger-menu, [data-testid="hamburger"]')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.hamburger-menu, [data-testid="hamburger"]')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 159
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts" --headed

---

## Failed Test: mobile nav & cart drawer fits viewport
- **Time**: 2025-10-05T21:21:47.713Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts:159
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.hamburger-menu, [data-testid="hamburger"]')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.hamburger-menu, [data-testid="hamburger"]')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 159
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts" --headed

---

## Failed Test: invalid product route shows not-found UX
- **Time**: 2025-10-05T21:21:57.379Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts:194
- **Error**: Error: page.goto: net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost:3000/products/nonexistent
Call log:
[2m  - navigating to "http://localhost:3000/products/nonexistent", waiting until "networkidle"[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 194
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts" --headed

---

## Failed Test: invalid product route shows not-found UX
- **Time**: 2025-10-05T21:22:06.849Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts:194
- **Error**: Error: page.goto: net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost:3000/products/nonexistent
Call log:
[2m  - navigating to "http://localhost:3000/products/nonexistent", waiting until "networkidle"[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 194
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts" --headed

---

## Failed Test: invalid cart quantity is rejected
- **Time**: 2025-10-05T21:22:16.764Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts:202
- **Error**: Error: page.goto: net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost:3000/products/smart-cup
Call log:
[2m  - navigating to "http://localhost:3000/products/smart-cup", waiting until "networkidle"[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 202
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts" --headed

---

## Failed Test: invalid cart quantity is rejected
- **Time**: 2025-10-05T21:22:25.686Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts:202
- **Error**: Error: page.goto: net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost:3000/products/smart-cup
Call log:
[2m  - navigating to "http://localhost:3000/products/smart-cup", waiting until "networkidle"[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 202
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts" --headed

---

## Failed Test: checkout requires required fields
- **Time**: 2025-10-05T21:22:33.695Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts:210
- **Error**: Error: page.goto: net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost:3000/checkout
Call log:
[2m  - navigating to "http://localhost:3000/checkout", waiting until "networkidle"[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 210
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.spec.ts" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T21:27:53.011Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:98
- **Error**: Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5000/
Call log:
[2m  - navigating to "http://localhost:5000/", waiting until "networkidle"[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 98
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey (landing → product → cart → checkout)
- **Time**: 2025-10-05T21:28:03.279Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:98
- **Error**: Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5000/
Call log:
[2m  - navigating to "http://localhost:5000/", waiting until "networkidle"[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 98
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: mobile nav & cart drawer fits viewport
- **Time**: 2025-10-05T21:28:33.403Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:649
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.mobile-menu.is-active, [data-testid="mobile-menu"].is-active')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.mobile-menu.is-active, [data-testid="mobile-menu"].is-active')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 649
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: mobile nav & cart drawer fits viewport
- **Time**: 2025-10-05T21:29:03.272Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:649
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('.mobile-menu.is-active, [data-testid="mobile-menu"].is-active')
Expected: visible
Received: <element(s) not found>
Timeout:  10000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.mobile-menu.is-active, [data-testid="mobile-menu"].is-active')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 649
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: invalid cart quantity is rejected
- **Time**: 2025-10-05T21:29:52.550Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:852
- **Error**: Error: locator.click: Target page, context or browser has been closed
Call log:
[2m  - waiting for getByRole('navigation').getByRole('link', { name: /products/i }).first()[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 852
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: Homepage structure and critical elements test
- **Time**: 2025-10-05T21:59:30.246Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey-clean.test.js:42
- **Error**: ReferenceError: PRIORITY_PAGES is not defined
- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 42
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey-clean.test.js" --headed

---

## Failed Test: Homepage structure and critical elements test
- **Time**: 2025-10-05T21:59:44.103Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey-clean.test.js:42
- **Error**: ReferenceError: PRIORITY_PAGES is not defined
- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 42
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey-clean.test.js" --headed

---

## Failed Test: should wait for hero animation to complete
- **Time**: 2025-10-05T22:11:18.308Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\test-animation-wait.test.js:4
- **Error**: Error: expect.toBeVisible: Error: strict mode violation: locator('nav') resolved to 2 elements:
    1) <nav class="damp-nav" role="navigation" aria-label="Main navigation">…</nav> aka getByRole('navigation', { name: 'Main navigation' })
    2) <nav role="navigation" class="mobile-nav">…</nav> aka getByLabel('Navigation Menu', { exact: true }).locator('nav')

Call log:
[2m  - Expect "toBeVisible" with timeout 30000ms[22m
[2m  - waiting for locator('nav')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 4
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\test-animation-wait.test.js" --headed

---

## Failed Test: should wait for hero animation to complete
- **Time**: 2025-10-05T22:11:40.119Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\test-animation-wait.test.js:4
- **Error**: Error: expect.toBeVisible: Error: strict mode violation: locator('nav') resolved to 2 elements:
    1) <nav class="damp-nav" role="navigation" aria-label="Main navigation">…</nav> aka getByRole('navigation', { name: 'Main navigation' })
    2) <nav role="navigation" class="mobile-nav">…</nav> aka getByLabel('Navigation Menu', { exact: true }).locator('nav')

Call log:
[2m  - Expect "toBeVisible" with timeout 30000ms[22m
[2m  - waiting for locator('nav')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 4
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\test-animation-wait.test.js" --headed

---

## Failed Test: should wait for hero animation to complete
- **Time**: 2025-10-05T22:11:55.856Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\test-animation-wait.test.js:4
- **Error**: Error: expect.toBeVisible: Error: strict mode violation: locator('nav') resolved to 2 elements:
    1) <nav class="damp-nav" role="navigation" aria-label="Main navigation">…</nav> aka getByRole('navigation', { name: 'Main navigation' })
    2) <nav role="navigation" class="mobile-nav">…</nav> aka getByLabel('Navigation Menu', { exact: true }).locator('nav')

Call log:
[2m  - Expect "toBeVisible" with timeout 30000ms[22m
[2m  - waiting for locator('nav')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 4
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\test-animation-wait.test.js" --headed

---

## Failed Test: should wait for hero animation to complete
- **Time**: 2025-10-05T22:12:05.769Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\test-animation-wait.test.js:4
- **Error**: Error: expect.toBeVisible: Error: strict mode violation: locator('nav') resolved to 2 elements:
    1) <nav class="damp-nav" role="navigation" aria-label="Main navigation">…</nav> aka getByRole('navigation', { name: 'Main navigation' })
    2) <nav role="navigation" class="mobile-nav">…</nav> aka getByLabel('Navigation Menu', { exact: true }).locator('nav')

Call log:
[2m  - Expect "toBeVisible" with timeout 30000ms[22m
[2m  - waiting for locator('nav')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 4
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\test-animation-wait.test.js" --headed

---

## Failed Test: should wait for hero animation to complete
- **Time**: 2025-10-05T22:12:27.222Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\test-animation-wait.test.js:4
- **Error**: Error: expect.toBeVisible: Error: strict mode violation: locator('nav') resolved to 2 elements:
    1) <nav class="damp-nav" role="navigation" aria-label="Main navigation">…</nav> aka getByRole('navigation', { name: 'Main navigation' })
    2) <nav role="navigation" class="mobile-nav">…</nav> aka getByLabel('Navigation Menu', { exact: true }).locator('nav')

Call log:
[2m  - Expect "toBeVisible" with timeout 30000ms[22m
[2m  - waiting for locator('nav')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 4
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\test-animation-wait.test.js" --headed

---

## Failed Test: Homepage structure and critical elements test
- **Time**: 2025-10-05T22:17:59.048Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:186
- **Error**: Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m()[22m failed

Locator:  locator('nav.main-navigation')
Expected: visible
Received: <element(s) not found>
Timeout:  5000ms

Call log:
[2m  - Expect "toBeVisible" with timeout 5000ms[22m
[2m  - waiting for locator('nav.main-navigation')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 186
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: Homepage structure and critical elements test
- **Time**: 2025-10-05T22:18:03.981Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:186
- **Error**: Error: browser.newContext: Target page, context or browser has been closed
Browser logs:

<launching> C:\Users\Zach\AppData\Local\ms-playwright\chromium-1193\chrome-win\chrome.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AcceptCHFrame,AvoidUnnecessaryBeforeUnloadCheckSync,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --enable-automation --no-sandbox --user-data-dir=C:\Users\Zach\AppData\Local\Temp\playwright_chromiumdev_profile-zD2q4J --remote-debugging-pipe --no-startup-window
<launched> pid=311164
[pid=311164] <gracefully close start>
- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 186
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

## Failed Test: complete user journey through priority pages
- **Time**: 2025-10-05T22:19:36.754Z
- **Location**: C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js:489
- **Error**: Error: expect.toBeVisible: Error: strict mode violation: locator('nav') resolved to 2 elements:
    1) <nav class="damp-nav" role="navigation" aria-label="Main navigation">…</nav> aka getByRole('navigation', { name: 'Main navigation' })
    2) <nav role="navigation" class="mobile-nav">…</nav> aka getByLabel('Navigation Menu', { exact: true }).locator('nav')

Call log:
[2m  - Expect "toBeVisible" with timeout 30000ms[22m
[2m  - waiting for locator('nav')[22m

- **Status**: 🔴 Fix Needed
- **Steps to Reproduce**:
  1. See test file at line 489
  2. Run test with: npx playwright test "C:\Users\Zach\Documents\Projects\damp-smart-drinkware\website\tests\e2e\full-user-journey.test.js" --headed

---

