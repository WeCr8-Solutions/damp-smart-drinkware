/**
 * Firebase Voting System Setup Script
 * Initializes all necessary collections and documents for DAMP voting system
 */

const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json'); // You'll need to download this

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'damp-smart-drinkware'
});

const db = admin.firestore();

async function initializeVotingSystem() {
  console.log('🚀 Initializing DAMP Voting System...');

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
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        siliconeBottom: {
          id: 'siliconeBottom',
          name: 'Silicone Bottom v1.0',
          description: 'Non-slip silicone base',
          image: '/assets/images/products/silicone-bottom/silicone-bottom.png',
          votes: 0,
          percentage: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        cupSleeve: {
          id: 'cupSleeve',
          name: 'Cup Sleeve v1.0',
          description: 'Adjustable fit for most cups',
          image: '/assets/images/products/cup-sleeve/cup-sleeve.png',
          votes: 0,
          percentage: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        babyBottle: {
          id: 'babyBottle',
          name: 'Baby Bottle v1.0',
          description: 'BPA-free smart bottle',
          image: '/assets/images/products/baby-bottle/baby-bottle.png',
          votes: 0,
          percentage: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      },
      settings: {
        votingActive: true,
        publicVotingActive: true,
        maxVotesPerUser: 1,
        allowVoteChanging: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      metadata: {
        totalVotes: 0,
        totalUsers: 0,
        totalPublicVotes: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }
    };

    await db.collection('voting').doc('productVoting').set(votingData);
    console.log('✅ Voting collection initialized');

    // 2. Initialize global stats
    const globalStats = {
      totalVotes: 0,
      totalUsers: 0,
      totalPublicVotes: 0,
      votingStartDate: admin.firestore.FieldValue.serverTimestamp(),
      lastVoteAt: null,
      products: {
        handle: { votes: 0, percentage: 0 },
        siliconeBottom: { votes: 0, percentage: 0 },
        cupSleeve: { votes: 0, percentage: 0 },
        babyBottle: { votes: 0, percentage: 0 }
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('stats').doc('global').set(globalStats);
    console.log('✅ Global stats initialized');

    // 3. Create sample authenticated user vote (template)
    const sampleUserVote = {
      userId: 'sample_user_id',
      productId: null,
      hasVoted: false,
      votedAt: null,
      browserFingerprint: null,
      ipAddress: null,
      userAgent: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('userVotes').doc('template').set(sampleUserVote);
    console.log('✅ User votes template created');

    // 4. Create sample public vote (template)
    const samplePublicVote = {
      sessionId: 'sample_session_id',
      browserFingerprint: 'sample_fingerprint',
      productId: null,
      hasVoted: false,
      votedAt: null,
      ipAddress: null,
      userAgent: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('publicVotes').doc('template').set(samplePublicVote);
    console.log('✅ Public votes template created');

    // 5. Create admin settings
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('voting').doc('settings').set(adminSettings);
    console.log('✅ Admin settings created');

    console.log('🎉 DAMP Voting System fully initialized!');
    console.log('\n📋 Collections created:');
    console.log('  - voting/productVoting (main voting data)');
    console.log('  - voting/settings (admin settings)');
    console.log('  - stats/global (global statistics)');
    console.log('  - userVotes/template (authenticated user votes template)');
    console.log('  - publicVotes/template (public votes template)');

    console.log('\n🔗 Access your data:');
    console.log('  - Firebase Console: https://console.firebase.google.com/project/damp-smart-drinkware/firestore');
    console.log('  - Test Page: http://localhost:5000/test-voting-system.html');

  } catch (error) {
    console.error('❌ Error initializing voting system:', error);
  }
}

// Run the initialization
initializeVotingSystem()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });