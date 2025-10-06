// Firebase Test Configuration
module.exports = {
    firebaseTestConfig: {
        apiKey: "test-api-key",
        authDomain: "localhost",
        projectId: "demo-test",
        storageBucket: "demo-test.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef123456",
        measurementId: "G-TEST123456"
    },

    firebaseEmulatorConfig: {
        auth: "http://localhost:9099",
        firestore: "http://localhost:8080",
        functions: "http://localhost:5001",
        storage: "http://localhost:9199"
    },

    // Helper to check if running in test environment
    isTestEnvironment: () => {
        return process.env.NODE_ENV === 'test' || 
               (typeof window !== 'undefined' && window.location.hostname === 'localhost');
    }
};