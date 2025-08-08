// Firebase services for DAMP Smart Drinkware - CDN Version
// This version uses CDN imports instead of ES6 modules for browser compatibility

// Firebase CDN Configuration
const FIREBASE_VERSION = '10.7.1';
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC_5VVYhCFnTMZdGH9PEcfvPYqFJF5LuLQ",
  authDomain: "damp-smart-drinkware.firebaseapp.com",
  projectId: "damp-smart-drinkware",
  storageBucket: "damp-smart-drinkware.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789",
  measurementId: "G-XXXXXXXXXX"
};

// Global Firebase services
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseStorage = null;
let firebaseAnalytics = null;

// Initialize Firebase services
async function initializeFirebaseServices() {
  try {
    // Load Firebase scripts dynamically
    if (!window.firebase) {
      await loadFirebaseScripts();
    }

    // Initialize Firebase app if not already initialized
    if (!firebaseApp) {
      firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
      firebaseAuth = firebase.auth();
      firebaseDb = firebase.firestore();
      firebaseStorage = firebase.storage();
      
      // Initialize analytics if available
      if (typeof gtag !== 'undefined') {
        firebaseAnalytics = firebase.analytics();
      }
    }

    console.log('✅ Firebase services initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return false;
  }
}

// Load Firebase scripts from CDN
function loadFirebaseScripts() {
  return new Promise((resolve, reject) => {
    const scripts = [
      `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,
      `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`,
      `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore-compat.js`,
      `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-storage-compat.js`,
      `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-analytics-compat.js`
    ];

    let loadedCount = 0;
    const totalScripts = scripts.length;

    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        loadedCount++;
        if (loadedCount === totalScripts) {
          resolve();
        }
      };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  });
}

// Voting Service
class VotingService {
  constructor() {
    this.votingCollection = 'productVoting';
    this.publicVotingCollection = 'publicProductVoting';
  }

  generateBrowserFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return 'fp_' + btoa(fingerprint).substring(0, 10);
  }

  async submitVote(productId, user) {
    if (!firebaseDb || !user) return false;
    
    try {
      const voteData = {
        productId,
        userId: user.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent
      };
      
      await firebaseDb.collection(this.votingCollection).doc(user.uid).set(voteData);
      console.log('✅ Vote submitted successfully');
      return true;
    } catch (error) {
      console.error('❌ Vote submission failed:', error);
      return false;
    }
  }

  async submitPublicVote(productId, fingerprint) {
    if (!firebaseDb) return false;
    
    try {
      const voteData = {
        productId,
        fingerprint,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent
      };
      
      await firebaseDb.collection(this.publicVotingCollection).doc(fingerprint).set(voteData);
      console.log('✅ Public vote submitted successfully');
      return true;
    } catch (error) {
      console.error('❌ Public vote submission failed:', error);
      return false;
    }
  }

  async getUserVote(user) {
    if (!firebaseDb || !user) return null;
    
    try {
      const doc = await firebaseDb.collection(this.votingCollection).doc(user.uid).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('❌ Failed to get user vote:', error);
      return null;
    }
  }

  async getPublicVote(fingerprint) {
    if (!firebaseDb) return null;
    
    try {
      const doc = await firebaseDb.collection(this.publicVotingCollection).doc(fingerprint).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('❌ Failed to get public vote:', error);
      return null;
    }
  }

  onVotingChange(callback) {
    if (!firebaseDb) return () => {};
    
    return firebaseDb.collection(this.votingCollection).onSnapshot(snapshot => {
      const votes = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.productId) {
          votes[data.productId] = (votes[data.productId] || 0) + 1;
        }
      });
      
      // Calculate percentages
      const total = Object.values(votes).reduce((sum, count) => sum + count, 0);
      const products = {};
      Object.keys(votes).forEach(productId => {
        products[productId] = {
          votes: votes[productId],
          percentage: total > 0 ? Math.round((votes[productId] / total) * 100) : 0
        };
      });
      
      callback({ products, total });
    });
  }

  onPublicVotingChange(callback) {
    if (!firebaseDb) return () => {};
    
    return firebaseDb.collection(this.publicVotingCollection).onSnapshot(snapshot => {
      const votes = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.productId) {
          votes[data.productId] = (votes[data.productId] || 0) + 1;
        }
      });
      
      // Calculate percentages
      const total = Object.values(votes).reduce((sum, count) => sum + count, 0);
      const products = {};
      Object.keys(votes).forEach(productId => {
        products[productId] = {
          votes: votes[productId],
          percentage: total > 0 ? Math.round((votes[productId] / total) * 100) : 0
        };
      });
      
      callback({ products, total });
    });
  }
}

// Auth Service
class AuthService {
  onAuthStateChanged(callback) {
    if (!firebaseAuth) return () => {};
    return firebaseAuth.onAuthStateChanged(callback);
  }

  async isAdmin(user) {
    if (!user || !firebaseDb) return false;
    
    try {
      const adminDoc = await firebaseDb.collection('admins').doc(user.uid).get();
      return adminDoc.exists;
    } catch (error) {
      console.error('❌ Failed to check admin status:', error);
      return false;
    }
  }
}

// Analytics Service
class AnalyticsService {
  trackEvent(eventName, parameters = {}) {
    try {
      if (firebaseAnalytics) {
        firebase.analytics().logEvent(eventName, parameters);
      }
      console.log(`📊 Event tracked: ${eventName}`, parameters);
    } catch (error) {
      console.error('❌ Analytics tracking failed:', error);
    }
  }
}

// Email Service
class EmailService {
  async subscribeToNewsletter(email, metadata = {}) {
    try {
      // This would typically call a Firebase Cloud Function
      console.log('📧 Newsletter subscription:', email, metadata);
      return { success: true };
    } catch (error) {
      console.error('❌ Newsletter subscription failed:', error);
      return { success: false, error };
    }
  }
}

// Export services
export {
  initializeFirebaseServices,
  VotingService,
  AuthService,
  AnalyticsService,
  EmailService
};

// Also make available globally for non-module scripts
window.FirebaseServicesCDN = {
  initializeFirebaseServices,
  VotingService,
  AuthService,
  AnalyticsService,
  EmailService
};