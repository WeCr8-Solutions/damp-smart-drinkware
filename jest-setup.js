/* eslint-disable no-undef */
/* global jest, window, document, HTMLElement, require */

// jest-setup.js
(function robustJestSetup() {
  // ---- 1) Testing Library matchers -------------------------------------------------
  try {
    require('@testing-library/jest-dom');
  } catch { /* optional */ }

  // ---- 2) Safe global ref ----------------------------------------------------------
  const g = (typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : window));

  // ---- 3) Node/WHATWG polyfills (define only if missing) ---------------------------
  // TextEncoder/TextDecoder (Node < 19)
  try {
    if (!g.TextEncoder || !g.TextDecoder) {
      const { TextEncoder, TextDecoder } = require('util');
      g.TextEncoder = g.TextEncoder || TextEncoder;
      g.TextDecoder = g.TextDecoder || TextDecoder;
    }
  } catch { /* util not found in some bundlers */ }

  // atob/btoa
  if (!g.atob) g.atob = (str) => Buffer.from(str, 'base64').toString('binary');
  if (!g.btoa) g.btoa = (str) => Buffer.from(str, 'binary').toString('base64');

  // crypto (getRandomValues/randomUUID)
  try {
    const nodeCrypto = require('crypto');
    if (!g.crypto) g.crypto = nodeCrypto.webcrypto || {};
    if (!g.crypto.getRandomValues && nodeCrypto.webcrypto?.getRandomValues) {
      g.crypto.getRandomValues = nodeCrypto.webcrypto.getRandomValues.bind(nodeCrypto.webcrypto);
    }
    if (!g.crypto.randomUUID && nodeCrypto.randomUUID) {
      g.crypto.randomUUID = nodeCrypto.randomUUID.bind(nodeCrypto);
    }
  } catch { /* ignore */ }

  // ReadableStream (Node >= 16 has stream/web)
  try {
    if (!g.ReadableStream) {
      const { ReadableStream } = require('stream/web');
      g.ReadableStream = ReadableStream;
    }
  } catch {
    // minimal stub to satisfy libraries that feature-detect ReadableStream
    if (!g.ReadableStream) {
      g.ReadableStream = class { /* no-op stub */ };
    }
  }

  // Headers/Request/Response/fetch (undici / Node 18+)
  // We'll still provide a jest mock by default, but keep constructors available.
  try {
    const undici = require('undici');
    ['Headers', 'Request', 'Response', 'FormData', 'File', 'fetch'].forEach((k) => {
      if (!g[k] && undici[k]) g[k] = undici[k];
    });
  } catch { /* ignore if not present */ }

  // AbortController
  try {
    if (!g.AbortController) {
      const { AbortController } = require('abort-controller');
      g.AbortController = AbortController;
    }
  } catch {
    if (!g.AbortController) {
      // tiny fallback (no real abort semantics; enough for tests that feature-detect)
      g.AbortController = class { constructor(){ this.signal = { aborted:false, addEventListener:()=>{}, removeEventListener:()=>{} }; } abort(){ this.signal.aborted = true; } };
    }
  }

  // URL/URLSearchParams (very old Node)
  if (!g.URL) g.URL = require('url').URL;
  if (!g.URLSearchParams) g.URLSearchParams = require('url').URLSearchParams;

  // ---- 4) Stable timer bridges & rAF ------------------------------------------------
  const nativeSetTimeout = g.setTimeout?.bind(g) || setTimeout;
  const nativeClearTimeout = g.clearTimeout?.bind(g) || clearTimeout;

  if (!g.requestAnimationFrame) {
    g.requestAnimationFrame = (cb) => nativeSetTimeout(() => cb(performance.now?.() ?? Date.now()), 0);
  }
  if (!g.cancelAnimationFrame) {
    g.cancelAnimationFrame = (id) => nativeClearTimeout(id);
  }

  // Expose Node timers explicitly (some libs import from global)
  g.setTimeout = g.setTimeout || nativeSetTimeout;
  g.clearTimeout = g.clearTimeout || nativeClearTimeout;

  // ---- 5) DOM shims that JSDOM often lacks -----------------------------------------
  // matchMedia
  if (!g.window.matchMedia) {
    g.window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
    });
  }

  // DOMRect
  if (!g.DOMRect) {
    g.DOMRect = class DOMRect {
      constructor(x=0,y=0,w=0,h=0){ this.x=x; this.y=y; this.width=w; this.height=h; this.top=y; this.left=x; this.right=x+w; this.bottom=y+h; }
      static fromRect(r={}){ return new g.DOMRect(r.x||0,r.y||0,r.width||0,r.height||0); }
    };
  }

  // getComputedStyle minimal fallback
  if (!g.getComputedStyle) {
    g.getComputedStyle = (el) => ({
      getPropertyValue: () => '',
      display: '',
      position: '',
      // extend with props you rely on in tests
    });
  }

  // localStorage/sessionStorage in-memory
  const makeMemoryStorage = () => {
    let store = new Map();
    return {
      getItem: (k) => (store.has(k) ? String(store.get(k)) : null),
      setItem: (k, v) => store.set(String(k), String(v)),
      removeItem: (k) => store.delete(String(k)),
      clear: () => { store.clear(); },
      key: (i) => Array.from(store.keys())[i] ?? null,
      get length() { return store.size; },
    };
  };
  if (!g.localStorage) g.localStorage = makeMemoryStorage();
  if (!g.sessionStorage) g.sessionStorage = makeMemoryStorage();

  // scrollTo/Page offsets
  if (!g.window.scrollTo) g.window.scrollTo = () => {};
  if (!Object.getOwnPropertyDescriptor(g.window, 'pageYOffset')) {
    Object.defineProperty(g.window, 'pageYOffset', { configurable: true, writable: true, value: 0 });
  }
  if (!Object.getOwnPropertyDescriptor(g.window, 'innerWidth')) {
    Object.defineProperty(g.window, 'innerWidth', { configurable: true, writable: true, value: 1024 });
  }

  // MutationObserver (noop if missing)
  if (!g.window.MutationObserver) {
    g.window.MutationObserver = class {
      constructor(cb){ this.cb = cb; }
      observe(){ /* no-op */ } disconnect(){ /* no-op */ } takeRecords(){ return []; }
    };
  }

  // ResizeObserver / IntersectionObserver (no-op shims)
  if (!g.window.ResizeObserver) {
    g.window.ResizeObserver = class {
      observe(){ /* no-op */ } unobserve(){ /* no-op */ } disconnect(){ /* no-op */ }
    };
  }
  if (!g.window.IntersectionObserver) {
    g.window.IntersectionObserver = class {
      constructor(){ /* ignore cb */ }
      observe(){ /* no-op */ } unobserve(){ /* no-op */ } disconnect(){ /* no-op */ } takeRecords(){ return []; }
    };
  }

  // CustomEvent (older JSDOM)
  try {
    new g.CustomEvent('x');
  } catch {
    g.CustomEvent = function(type, params) {
      const event = new g.Event(type, params);
      event.detail = params && params.detail || null;
      return event;
    };
    g.CustomEvent.prototype = g.Event.prototype;
  }

  // ---- 6) Event constructors (define only if missing) -------------------------------
  if (!g.Event) {
    g.Event = class {
      constructor(type, opts={}) { this.type = type; this.bubbles = !!opts.bubbles; this.cancelable = !!opts.cancelable; this.defaultPrevented = false; }
      preventDefault(){ this.defaultPrevented = true; }
      stopPropagation(){ /* noop */ }
    };
  }
  if (!g.KeyboardEvent) {
    g.KeyboardEvent = class extends g.Event {
      constructor(type, opts={}) { super(type, opts); this.key = opts.key ?? ''; this.code = opts.code ?? ''; this.keyCode = opts.keyCode ?? 0; }
    };
  }
  if (!g.MouseEvent) {
    g.MouseEvent = class extends g.Event {
      constructor(type, opts={}) { super(type, opts); this.clientX = opts.clientX ?? 0; this.clientY = opts.clientY ?? 0; }
    };
  }

  // ---- 7) Flexible fetch mock + helpers --------------------------------------------
  // By default, we mock fetch; set MOCK_FETCH=0 to use real fetch in tests that need it.
  const shouldMockFetch = process.env.MOCK_FETCH !== '0';
  if (shouldMockFetch) {
    const defaultPayload = { name: 'Test Product', price: '$99.99', features: ['Feature 1', 'Feature 2'] };
    const createResponse = (body, init={}) => {
      const status = init.status || 200;
      const ok = status >= 200 && status < 300;
      const headers = new g.Headers(init.headers || { 'Content-Type': 'application/json' });
      const text = () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body));
      const json = () => Promise.resolve(typeof body === 'string' ? JSON.parse(body || '{}') : body);
      return Promise.resolve(new g.Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers, ...init, }));
    };

    const fetchMock = jest.fn(async (input, init) => {
      // default success response
      return createResponse(defaultPayload, { status: 200 });
    });

    fetchMock.mockSuccessOnce = (data = defaultPayload, init = {}) =>
      fetchMock.mockImplementationOnce(() => createResponse(data, { status: 200, ...init }));

    fetchMock.mockErrorOnce = (status = 500, body = { error: 'Internal Error' }, init = {}) =>
      fetchMock.mockImplementationOnce(() => createResponse(body, { status, ...init }));

    fetchMock.setDefault = (impl) => fetchMock.mockImplementation(impl);
    fetchMock.resetDefault = () => fetchMock.setDefault(() => createResponse(defaultPayload, { status: 200 }));

    g.fetch = fetchMock;
  }

  // ---- 8) Handy async utilities for tests ------------------------------------------
  g.testUtils = Object.assign(g.testUtils || {}, {
    flushPromises: () => new Promise((r) => nativeSetTimeout(r, 0)),
    advanceTimersByTimeAsync: async (ms) => { jest.advanceTimersByTime(ms); await new Promise((r) => nativeSetTimeout(r, 0)); },
    nextTick: () => Promise.resolve(),
  });

  // ---- 9) Safer Custom Elements registration ---------------------------------------
  const safeDefineCustomElement = (name, ctor) => {
    if (!g.window?.customElements) return;
    if (!g.window.customElements.get(name)) {
      g.window.customElements.define(name, ctor);
    }
  };

  // ---- 10) Example robust custom element (ProductCard) ------------------------------
  // Kept here because your original setup registered it globally for tests.
  // Now includes: observedAttributes, abortable fetch, idempotent define, and dataset sync.
  class ProductCard extends HTMLElement {
    static get observedAttributes() { return ['product-id', 'data-state']; }

    constructor() {
      super();
      this._state = 'loading';
      this._ac = null;
      this.attachShadow({ mode: 'open' });
      this.classList.add('product-card', 'product-card--loading');
    }

    attributeChangedCallback(name, _old, value) {
      if (name === 'data-state') {
        this._state = value;
        this.classList.toggle('product-card--loading', value === 'loading');
        this.classList.toggle('product-card--error', value === 'error');
      }
      if (name === 'product-id' && this.isConnected && value) {
        this.fetchProductData(value);
      }
    }

    connectedCallback() {
      const pid = this.getAttribute('product-id');
      if (pid) this.fetchProductData(pid);
    }

    disconnectedCallback() {
      if (this._ac) { try { this._ac.abort(); } catch {} }
      this._ac = null;
    }

    async fetchProductData(productId) {
      if (this._ac) { try { this._ac.abort(); } catch {} }
      this._ac = new g.AbortController();

      try {
        this.setAttribute('data-state', 'loading');
        const res = await g.fetch(`/api/products/${productId}`, { signal: this._ac.signal });
        if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
        const data = await res.json();
        this.render(data);
        this.setAttribute('data-state', 'ready');
      } catch (err) {
        this.renderError(err);
        this.setAttribute('data-state', 'error');
      }
    }

    render(data) {
      this.classList.remove('product-card--loading');
      this.shadowRoot.innerHTML = `
        <div class="product-card__inner">
          <h3>${escapeHtml(data?.name ?? 'Unknown')}</h3>
          <p>${escapeHtml(data?.price ?? '')}</p>
          <ul>
            ${(Array.isArray(data?.features) ? data.features : []).map(f => `<li>${escapeHtml(String(f))}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    renderError(error) {
      this.classList.add('product-card--error');
      this.shadowRoot.innerHTML = `
        <div class="product-card__error">
          <p>Unable to load product</p>
          <small>${escapeHtml(error?.message ?? 'Unknown error')}</small>
        </div>
      `;
    }
  }

  const escapeHtml = (s) => String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  safeDefineCustomElement('product-card', ProductCard);

  // ---- 11) JSDOM environment niceties ----------------------------------------------
  try { document.documentElement.scrollTop = 0; } catch { /* ignore */ }
  try {
    // helpful default UA for libs that branch on it
    Object.defineProperty(g.navigator || {}, 'userAgent', {
      get: () => 'Mozilla/5.0 (Jest/JSDOM)',
      configurable: true,
    });
  } catch { /* ignore */ }

  // ---- 12) After-each hygiene (safe, minimal) --------------------------------------
  // If you'd rather manage this in your own tests, feel free to remove.
  afterEach(() => {
    jest.clearAllMocks();
    // Avoid leaking DOM between tests
    document.body.innerHTML = '';
  });

})();
