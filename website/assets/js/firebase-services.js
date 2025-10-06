/**
 * DAMP Smart Drinkware - Firebase Services Integration
 * Enhanced with Storage, Remote Config, Analytics, and Cloud Messaging
 */

// Dynamic imports to make Firebase optional
let auth, db, functions, storage, remoteConfig, analytics, messaging;
let isInitialized = false;

// Firebase configuration
const getFirebaseConfig = () => ({
    apiKey: window.FIREBASE_CONFIG?.apiKey || "your_firebase_api_key_here",
    authDomain: "damp-smart-drinkware.firebaseapp.com",
    projectId: "damp-smart-drinkware",
    storageBucket: "damp-smart-drinkware.firebasestorage.app",
    messagingSenderId: "309818614427",
    appId: "1:309818614427:web:db15a4851c05e58aa25c3e",
    measurementId: "G-YW2BN4SVPQ",
    databaseURL: "https://damp-smart-drinkware-default-rtdb.firebaseio.com"
});

// Initialize Firebase only when needed
export const initializeFirebase = async (options = {}) => {
    if (isInitialized) return { auth, db, functions, storage, remoteConfig, analytics, messaging };

    try {
        const [
            { initializeApp },
            { getAuth, connectAuthEmulator },
            { getFirestore, connectFirestoreEmulator },
            { getFunctions, connectFunctionsEmulator },
            { getStorage, connectStorageEmulator },
            { getRemoteConfig },
            { getAnalytics },
            { getMessaging }
        ] = await Promise.all([
            import('firebase/app'),
            import('firebase/auth'),
            import('firebase/firestore'),
            import('firebase/functions'),
            import('firebase/storage'),
            import('firebase/remote-config'),
            import('firebase/analytics'),
            import('firebase/messaging')
        ]);

        const app = initializeApp(getFirebaseConfig());

        // Initialize services
        auth = getAuth(app);
        db = getFirestore(app);
        functions = getFunctions(app);
        storage = getStorage(app);
        remoteConfig = getRemoteConfig(app);
        analytics = getAnalytics(app);
        messaging = getMessaging(app);

        // Connect to emulators in test environment if needed
        if (options.useEmulators) {
            connectAuthEmulator(auth, 'http://localhost:9099');
            connectFirestoreEmulator(db, 'localhost', 8080);
            connectFunctionsEmulator(functions, 'localhost', 5001);
            connectStorageEmulator(storage, 'localhost', 9199);
        }

        isInitialized = true;
        return { auth, db, functions, storage, remoteConfig, analytics, messaging };
    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        return null;
    }
};

// Remote Config settings
export const initializeRemoteConfig = async () => {
    if (!remoteConfig) return null;

    remoteConfig.settings = {
        minimumFetchIntervalMillis: 3600000, // 1 hour
    };

    remoteConfig.defaultConfig = {
        'alert_distance_threshold': 10,
        'battery_warning_threshold': 20,
        'notification_cooldown_minutes': 15,
        'app_maintenance_mode': false,
        'support_contact_email': 'support@dampdrink.com'
    };

    return remoteConfig;
};

// Messaging setup
let messagingInitialized = false;

export const initializeMessaging = async () => {
    if (!messaging || messagingInitialized) return null;

    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            const { getToken, onMessage } = await import('firebase/messaging');
            
            const token = await getToken(messaging, {
                vapidKey: 'your-vapid-key'
            });

            if (token) {
                console.log('FCM Token:', token);
                await storeMessagingToken(token);
            }

            onMessage(messaging, (payload) => {
                console.log('Received foreground message:', payload);
                showNotification(payload.notification);
            });

            messagingInitialized = true;
            return messaging;
        }
    } catch (error) {
        console.error('Error initializing messaging:', error);
        return null;
    }
};

// Custom notification display
const showNotification = (notification) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/assets/images/logo/android-icon-192x192.png',
        tag: 'damp-notification',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Details'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });
    });
  }
};

// Store FCM token in user profile
const storeMessagingToken = async (token) => {
  if (auth.currentUser) {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        fcmToken: token,
        lastTokenUpdate: new Date()
      });
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  }
};

// Remote Config helpers
export const getRemoteConfigValue = async (parameter) => {
  try {
    const { fetchAndActivate, getValue } = await import('firebase/remote-config');
    await fetchAndActivate(remoteConfig);
    return getValue(remoteConfig, parameter).asString();
  } catch (error) {
    console.error('Error fetching remote config:', error);
    return remoteConfig.defaultConfig[parameter];
  }
};

export const getRemoteConfigBoolean = async (parameter) => {
  try {
    const { fetchAndActivate, getValue } = await import('firebase/remote-config');
    await fetchAndActivate(remoteConfig);
    return getValue(remoteConfig, parameter).asBoolean();
  } catch (error) {
    console.error('Error fetching remote config:', error);
    return remoteConfig.defaultConfig[parameter] === 'true';
  }
};

export const getRemoteConfigNumber = async (parameter) => {
  try {
    const { fetchAndActivate, getValue } = await import('firebase/remote-config');
    await fetchAndActivate(remoteConfig);
    return getValue(remoteConfig, parameter).asNumber();
  } catch (error) {
    console.error('Error fetching remote config:', error);
    return parseInt(remoteConfig.defaultConfig[parameter]) || 0;
  }
};

// Analytics helpers
export const logEvent = (eventName, parameters = {}) => {
  try {
    const { logEvent: firebaseLogEvent } = analytics;
    firebaseLogEvent(analytics, eventName, parameters);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

export const logPageView = (pageName) => {
  logEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href
  });
};

export const logUserAction = (action, details = {}) => {
  logEvent('user_action', {
    action_type: action,
    ...details
  });
};

// Storage helpers
export const uploadFile = async (file, path) => {
  try {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const uploadProfileImage = async (file, userId) => {
  const path = `users/${userId}/profile/${file.name}`;
  return await uploadFile(file, path);
};

// Development environment setup
if (window.location.hostname === 'localhost') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.log('Emulators already connected or not running');
  }
}

// Initialize services on load
document.addEventListener('DOMContentLoaded', () => {
  initializeMessaging();
  logPageView(document.title);
});

export default app;