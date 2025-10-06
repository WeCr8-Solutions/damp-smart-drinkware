/* global jest, describe, beforeEach, afterEach, test, expect, document, customElements, global */

// tests/components/product-card.spec.js
describe('ProductCard Component', () => {
  let container;

  // Simple polling helper so we don't rely on fixed timeouts
  const waitFor = async (predicate, { timeout = 1500, interval = 25 } = {}) => {
    const start = Date.now();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        if (await predicate()) return;
      } catch { /* ignore */ }
      if (Date.now() - start > timeout) {
        throw new Error('waitFor: timed out');
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, interval));
    }
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Dynamic product catalog for tests
    const PRODUCTS = {
      'test-product': {
        name: 'Test Product',
        price: '$29.99',
        features: ['Feature 1', 'Feature 2'],
      },
      'pro-cup': {
        name: 'Pro Cup',
        price: '$49.00',
        features: ['Stainless body', '12h hot / 24h cold'],
      },
      'elite-bottle': {
        name: 'Elite Bottle',
        price: '$79.95',
        features: ['Titanium lid', 'BLE tag'],
      },
    };

    // Dynamic fetch mock based on product-id parsed from URL /api/products/:id
    global.fetch = jest.fn(async (url) => {
      const match = String(url).match(/\/api\/products\/([^/?#]+)/i);
      const id = match?.[1];
      const data = id && PRODUCTS[id];

      if (!data) {
        return {
          ok: false,
          status: 404,
          json: async () => ({ error: 'Not found' }),
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => data,
      };
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.restoreAllMocks();
  });

  test('renders loading state initially', () => {
    const card = document.createElement('product-card');
    card.setAttribute('product-id', 'test-product');
    container.appendChild(card);

    expect(card.classList.contains('product-card--loading')).toBe(true);
  });

  test.each([
    ['test-product', 'Test Product', '$29.99'],
    ['pro-cup', 'Pro Cup', '$49.00'],
    ['elite-bottle', 'Elite Bottle', '$79.95'],
  ])('renders product "%s" with correct dynamic price', async (productId, expectedName, expectedPrice) => {
    const card = document.createElement('product-card');
    card.setAttribute('product-id', productId);
    container.appendChild(card);

    // Wait for content to render
    await waitFor(() => card.shadowRoot && card.shadowRoot.textContent.includes(expectedName));

    const html = card.shadowRoot.innerHTML;
    expect(html).toContain(expectedName);
    expect(html).toContain(expectedPrice);
    expect(card.classList.contains('product-card--loading')).toBe(false);
  });

  test('handles 404 product gracefully', async () => {
    const card = document.createElement('product-card');
    // product id that does not exist in our mock
    card.setAttribute('product-id', 'does-not-exist');
    container.appendChild(card);

    await waitFor(() => card.classList.contains('product-card--error'));

    const html = card.shadowRoot.innerHTML;
    expect(card.classList.contains('product-card--error')).toBe(true);
    expect(html).toContain('Unable to load product');
  });

  test('handles network error gracefully', async () => {
    // Force the next fetch to reject
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const card = document.createElement('product-card');
    card.setAttribute('product-id', 'test-product');
    container.appendChild(card);

    await waitFor(() => card.classList.contains('product-card--error'));

    const html = card.shadowRoot.innerHTML;
    expect(card.classList.contains('product-card--error')).toBe(true);
    expect(html).toContain('Unable to load product');
    expect(html).toContain('Network error');
  });
});
