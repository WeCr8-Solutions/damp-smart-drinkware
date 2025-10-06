// setup-test-env.js
require('@testing-library/jest-dom');
require('./website/tests/config/browser-mocks.js');

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 767
    });
    Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        value: 0
    });
    Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 0
    });
}

beforeEach(() => {
    if (typeof window !== 'undefined') {
        window.pageYOffset = 0;
        window.scrollY = 0;
        window.innerWidth = 767;
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 0));
    }
    jest.useFakeTimers();
});

afterEach(() => {
    if (typeof document !== 'undefined' && document.body) {
        document.body.innerHTML = '';
    }
    if (typeof window !== 'undefined') {
        window.pageYOffset = 0;
        window.scrollY = 0;
        window.innerWidth = 767;
    }
    jest.clearAllMocks();
    jest.useRealTimers();
});

// Define Event first since KeyboardEvent extends it
const MockEvent = class {
    constructor(type, options = {}) {
        this.type = type;
        this.bubbles = !!options.bubbles;
        this.cancelable = !!options.cancelable;
        this.composed = !!options.composed;
        this.defaultPrevented = false;
        this.propagationStopped = false;
    }

    preventDefault() {
        if (this.cancelable) {
            this.defaultPrevented = true;
        }
    }

    stopPropagation() {
        this.propagationStopped = true;
    }
};

const MockKeyboardEvent = class extends MockEvent {
    constructor(type, options = {}) {
        super(type, options);
        this.key = options.key || '';
        this.code = options.code || '';
    }
};

global.Event = global.Event || MockEvent;
global.KeyboardEvent = global.KeyboardEvent || MockKeyboardEvent;

// Mock window properties for navigation tests
const setupWindowMocks = () => {
    if (typeof window === 'undefined') {
        return;
    }

    Object.defineProperties(window, {
        pageYOffset: {
            writable: true,
            value: 0
        },
        innerWidth: {
            writable: true,
            value: 767
        },
        scrollY: {
            writable: true,
            value: 0
        }
    });

    // Mock requestAnimationFrame and cancelAnimationFrame
    window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 0);
    };

    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
};

// Global test setup
beforeEach(() => {
    setupWindowMocks();
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 0));
});

afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    document.body.innerHTML = '';
    window.pageYOffset = 0;
    window.scrollY = 0;
    window.innerWidth = 767;
});

// Helper for creating events
global.createCustomEvent = (eventName, eventInit = {}) => {
    if (eventName === 'keydown') {
        return new KeyboardEvent(eventName, {
            bubbles: true,
            cancelable: true,
            ...eventInit
        });
    }

    // Mock the Event class if not available (for Node environment)
    class MockEvent {
        constructor(type, options = {}) {
            this.type = type;
            this.bubbles = !!options.bubbles;
            this.cancelable = !!options.cancelable;
            this.composed = !!options.composed;
            this.defaultPrevented = false;
            this.propagationStopped = false;
        }

        preventDefault() {
            if (this.cancelable) {
                this.defaultPrevented = true;
            }
        }

        stopPropagation() {
            this.propagationStopped = true;
        }
    }

    const EventConstructor = typeof Event !== 'undefined' ? Event : MockEvent;
    return new EventConstructor(eventName, {
        bubbles: true,
        cancelable: true,
        ...eventInit
    });
};

    preventDefault() {
        this.defaultPrevented = true;
    }

    stopPropagation() {
        this._propagationStopped = true;
    }
}

// Create event helper
global.createCustomEvent = (type, init = {}) => {
    const event = document.createEvent('Event');
    event.initEvent(type, init.bubbles || false, init.cancelable || false);
    Object.assign(event, init);
    return event;
};