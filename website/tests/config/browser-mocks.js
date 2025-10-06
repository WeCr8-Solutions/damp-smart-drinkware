// Global mocks for browser APIs
global.window = {
    FIREBASE_CONFIG: undefined,
    location: { hostname: 'localhost' }
};

global.navigator = {
    serviceWorker: {
        register: jest.fn().mockResolvedValue({ update: jest.fn() }),
        getRegistration: jest.fn().mockResolvedValue({ update: jest.fn() })
    }
};

global.Notification = {
    permission: 'granted',
    requestPermission: jest.fn().mockResolvedValue('granted')
};

global.document = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    createElement: jest.fn(),
    body: {
        appendChild: jest.fn()
    }
};

// Console is already defined in Node.js environment