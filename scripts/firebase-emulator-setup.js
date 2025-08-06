/**
 * Firebase Emulator Voting System Setup
 * Sets up voting collections in the local Firebase emulator
 */

// This script works with Firebase emulators (no service account needed)
const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Initialize Firebase for emulator
const firebaseConfig = {
  projectId: 'damp-smart-drinkware' // Must match your project ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator
connectFirestoreEmulator(db, 'localhost', 8080);

async function setupEmulatorVotingSystem() {
  console.log('🚀 Setting up DAMP Voting System in Firebase Emulator...');

  try {
    // 1. Initialize voting collection with product data
    const votingData = {
      products: {
        handle: {
          id: 'handle',
          name: 'DAMP Handle v1.0',
          description: 'Universal attachment for any drinkware',
          image: '/assets/images/products/damp-handle/damp-handle.png',
          votes: 0,
          percentage: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        siliconeBottom: {
          id: 'siliconeBottom',
          name: 'Silicone Bottom v1.0',
          description: 'Non-slip silicone base',
          image: '/assets/images/products/silicone-bottom/silicone-bottom.png',
          votes: 0,
          percentage: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        cupSleeve: {
          id: 'cupSleeve',
          name: 'Cup Sleeve v1.0',
          description: 'Adjustable fit for most cups',
          image: '/assets/images/products/cup-sleeve/cup-sleeve.png',
          votes: 0,
          percentage: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        babyBottle: {
          id: 'babyBottle',
          name: 'Baby Bottle v1.0',
          description: 'BPA-free smart bottle',
          image: '/assets/images/products/baby-bottle/baby-bottle.png',
          votes: 0,
          percentage: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      },
      settings: {
        votingActive: true,
        publicVotingActive: true,
        maxVotesPerUser: 1,
        allowVoteChanging: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      metadata: {
        totalVotes: 0,
        totalUsers: 0,
        totalPublicVotes: 0,
        lastUpdated: serverTimestamp()
      }
    };

    await setDoc(doc(db, 'voting', 'productVoting'), votingData);
    console.log('✅ Voting collection initialized');

    // 2. Initialize global stats
    const globalStats = {
      totalVotes: 0,
      totalUsers: 0,
      totalPublicVotes: 0,
      votingStartDate: serverTimestamp(),
      lastVoteAt: null,
      products: {
        handle: { votes: 0, percentage: 0 },
        siliconeBottom: { votes: 0, percentage: 0 },
        cupSleeve: { votes: 0, percentage: 0 },
        babyBottle: { votes: 0, percentage: 0 }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'stats', 'global'), globalStats);
    console.log('✅ Global stats initialized');

    // 3. Create voting settings
    const adminSettings = {
      votingEnabled: true,
      publicVotingEnabled: true,
      moderationEnabled: false,
      antiSpamEnabled: true,
      maxVotesPerIP: 1,
      maxVotesPerFingerprint: 1,
      votingEndDate: null,
      resultsVisible: true,
      allowVoteChanging: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'voting', 'settings'), adminSettings);
    console.log('✅ Admin settings created');

    console.log('\n🎉 DAMP Voting System fully initialized in emulator!');
    console.log('\n📋 Collections created:');
    console.log('  - voting/productVoting (main voting data)');
    console.log('  - voting/settings (admin settings)'); 
    console.log('  - stats/global (global statistics)');

    console.log('\n🔗 Access your data:');
    console.log('  - Emulator UI: http://localhost:4000');
    console.log('  - Firestore Emulator: http://localhost:4000/firestore');
    console.log('  - Test Page: http://localhost:5000/test-voting-system.html');

  } catch (error) {
    console.error('❌ Error setting up voting system:', error);
  }
}

// Run the setup
setupEmulatorVotingSystem()
  .then(() => {
    console.log('✅ Emulator setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Emulator setup failed:', error);
    process.exit(1);
  });