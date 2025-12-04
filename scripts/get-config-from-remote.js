/**
 * Helper function to get configuration from Firebase Remote Config
 * This can be used in client code to fetch config values at runtime
 * 
 * Example usage:
 *   const apiKey = await getConfigFromRemote('firebase_api_key');
 */

/**
 * Get a configuration value from Firebase Remote Config
 * @param {string} key - The Remote Config parameter key
 * @param {string} defaultValue - Fallback value if Remote Config fails
 * @returns {Promise<string>} The configuration value
 */
export async function getConfigFromRemote(key, defaultValue = '') {
  try {
    // Import Firebase services
    const { initializeFirebase, getRemoteConfigValue } = await import('../website/assets/js/firebase-services.js');
    
    // Initialize Firebase if not already done
    const firebase = await initializeFirebase();
    if (!firebase || !firebase.remoteConfig) {
      console.warn('Remote Config not available, using default value');
      return defaultValue;
    }

    // Fetch and get value
    const value = await getRemoteConfigValue(key);
    return value || defaultValue;
  } catch (error) {
    console.error(`Error fetching Remote Config for ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Get Firebase configuration from Remote Config
 * @returns {Promise<Object>} Firebase config object
 */
export async function getFirebaseConfigFromRemote() {
  try {
    const [
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
      databaseURL
    ] = await Promise.all([
      getConfigFromRemote('firebase_api_key', 'AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w'),
      getConfigFromRemote('firebase_auth_domain', 'damp-smart-drinkware.firebaseapp.com'),
      getConfigFromRemote('firebase_project_id', 'damp-smart-drinkware'),
      getConfigFromRemote('firebase_storage_bucket', 'damp-smart-drinkware.firebasestorage.app'),
      getConfigFromRemote('firebase_messaging_sender_id', '309818614427'),
      getConfigFromRemote('firebase_app_id', '1:309818614427:web:db15a4851c05e58aa25c3e'),
      getConfigFromRemote('firebase_measurement_id', 'G-YW2BN4SVPQ'),
      getConfigFromRemote('firebase_database_url', 'https://damp-smart-drinkware-default-rtdb.firebaseio.com')
    ]);

    return {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
      databaseURL
    };
  } catch (error) {
    console.error('Error fetching Firebase config from Remote Config:', error);
    // Return fallback config
    return {
      apiKey: 'AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w',
      authDomain: 'damp-smart-drinkware.firebaseapp.com',
      projectId: 'damp-smart-drinkware',
      storageBucket: 'damp-smart-drinkware.firebasestorage.app',
      messagingSenderId: '309818614427',
      appId: '1:309818614427:web:db15a4851c05e58aa25c3e',
      measurementId: 'G-YW2BN4SVPQ',
      databaseURL: 'https://damp-smart-drinkware-default-rtdb.firebaseio.com'
    };
  }
}

/**
 * Get Stripe publishable key from Remote Config
 * @returns {Promise<string>} Stripe publishable key
 */
export async function getStripePublishableKeyFromRemote() {
  return await getConfigFromRemote('stripe_publishable_key', 'pk_test_your_publishable_key');
}

