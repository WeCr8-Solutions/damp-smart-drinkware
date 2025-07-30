// Firebase configuration for DAMP Smart Drinkware Web App
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: window.FIREBASE_CONFIG?.apiKey || window.DAMP_CONFIG?.firebase?.apiKey || "your_firebase_api_key_here",
  authDomain: "damp-smart-drinkware.firebaseapp.com",
  projectId: "damp-smart-drinkware",
  storageBucket: "damp-smart-drinkware.firebasestorage.app",
  messagingSenderId: "309818614427",
  appId: "1:309818614427:web:db15a4851c05e58aa25c3e",
  measurementId: "G-YW2BN4SVPQ",
  databaseURL: "https://damp-smart-drinkware-default-rtdb.firebaseio.com"
};

// Validate configuration
if (firebaseConfig.apiKey === "your_firebase_api_key_here") {
  console.warn('⚠️ Firebase API key not configured - voting system will use fallback mode');
}

console.log('🔥 Firebase config loaded:', { 
  hasApiKey: firebaseConfig.apiKey !== "your_firebase_api_key_here",
  projectId: firebaseConfig.projectId 
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (window.location.hostname === 'localhost') {
  // Connect to emulators only if not already connected
  if (!auth._delegate._config.emulator) {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  }
  
  if (!db._delegate._config.settings?.host?.includes('localhost')) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  
  if (!functions._delegate.region) {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
  
  if (!storage._delegate._config.host?.includes('localhost')) {
    connectStorageEmulator(storage, 'localhost', 9199);
  }
}

// Export the app instance
export default app; 