/**
 * Firebase Configuration for DAMP Smart Drinkware
 * Production environment configuration
 */

// Firebase Web App Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w",
  authDomain: "damp-smart-drinkware.firebaseapp.com",
  databaseURL: "https://damp-smart-drinkware-default-rtdb.firebaseio.com",
  projectId: "damp-smart-drinkware",
  storageBucket: "damp-smart-drinkware.firebasestorage.app",
  messagingSenderId: "309818614427",
  appId: "1:309818614427:web:db15a4851c05e58aa25c3e",
  measurementId: "G-YW2BN4SVPQ"
};

// For Node.js/Admin SDK
const adminConfig = {
  projectId: "damp-smart-drinkware",
  databaseURL: "https://damp-smart-drinkware-default-rtdb.firebaseio.com",
  storageBucket: "damp-smart-drinkware.firebasestorage.app"
};

module.exports = {
  firebaseConfig,
  adminConfig,
  projectInfo: {
    name: "damp-smart-drinkware",
    id: "damp-smart-drinkware",
    number: "309818614427",
    environment: "production"
  }
};
