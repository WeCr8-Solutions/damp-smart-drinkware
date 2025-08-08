/**
 * 🗳️ DAMP Smart Drinkware - Unified Voting Service
 * Cross-platform voting system for product preferences and feedback
 * Works on both web and mobile platforms
 */

import { FeatureFlags } from '@/config/feature-flags';
import { auth, db } from '@/firebase/config';

// Mock implementations for when Firebase is disabled
let getDoc: any, setDoc: any, updateDoc: any, doc: any, onSnapshot: any, serverTimestamp: any;

if (FeatureFlags.FIREBASE) {
  try {
    const firestore = require('firebase/firestore');
    getDoc = firestore.getDoc;
    setDoc = firestore.setDoc;
    updateDoc = firestore.updateDoc;
    doc = firestore.doc;
    onSnapshot = firestore.onSnapshot;
    serverTimestamp = firestore.serverTimestamp;
  } catch (error) {
    console.warn('Firebase Firestore not available - using mocks');
    getDoc = () => Promise.resolve({ exists: () => false });
    setDoc = () => Promise.resolve();
    updateDoc = () => Promise.resolve();
    doc = () => ({});
    onSnapshot = () => () => {};
    serverTimestamp = () => new Date();
  }
} else {
  getDoc = () => Promise.resolve({ exists: () => false });
  setDoc = () => Promise.resolve();
  updateDoc = () => Promise.resolve();
  doc = () => ({});
  onSnapshot = () => () => {};
  serverTimestamp = () => new Date();
}

export interface ProductVote {
  name: string;
  description: string;
  votes: number;
  percentage: number;
}

export interface VotingData {
  type: 'authenticated' | 'public';
  title: string;
  description: string;
  products: Record<string, ProductVote>;
  totalVotes: number;
  lastUpdated: any;
  isActive: boolean;
}

export interface VoteSubmission {
  productId: string;
  userId?: string;
  timestamp: any;
  platform: 'web' | 'mobile';
}

class VotingService {
  private votingListeners: Map<string, () => void> = new Map();

  /**
   * Initialize voting data if it doesn't exist
   */
  async initializeVoting(): Promise<void> {
    if (!FeatureFlags.FIREBASE) return;

    try {
      const votingDoc = await getDoc(doc(db, 'voting', 'products'));
      if (!votingDoc.exists()) {
        await setDoc(doc(db, 'voting', 'products'), {
          type: 'authenticated',
          title: 'Customer Product Preferences',
          description: 'Authenticated votes from DAMP users and customers',
          products: {
            handle: {
              name: 'DAMP Handle',
              description: 'Universal clip-on handle for any drinkware',
              votes: 1245,
              percentage: 43.7
            },
            siliconeBottom: {
              name: 'Silicone Bottom',
              description: 'Non-slip smart base for bottles and tumblers',
              votes: 823,
              percentage: 28.9
            },
            cupSleeve: {
              name: 'Cup Sleeve',
              description: 'Adjustable smart sleeve with thermal insulation',
              votes: 512,
              percentage: 18.0
            },
            babyBottle: {
              name: 'Baby Bottle',
              description: 'Smart baby bottle with feeding tracking',
              votes: 267,
              percentage: 9.4
            }
          },
          totalVotes: 2847,
          lastUpdated: serverTimestamp(),
          isActive: true
        });
      }
    } catch (error) {
      console.error('Initialize voting error:', error);
    }
  }

  /**
   * Initialize public voting data
   */
  async initializePublicVoting(): Promise<void> {
    if (!FeatureFlags.FIREBASE) return;

    try {
      const publicVotingDoc = await getDoc(doc(db, 'voting', 'public'));
      if (!publicVotingDoc.exists()) {
        await setDoc(doc(db, 'voting', 'public'), {
          type: 'public',
          title: 'Community Product Demand',
          description: 'Open public voting for broader market insights',
          products: {
            handle: {
              name: 'DAMP Handle',
              description: 'Universal clip-on handle for any drinkware',
              votes: 2891,
              percentage: 41.2
            },
            siliconeBottom: {
              name: 'Silicone Bottom',
              description: 'Non-slip smart base for bottles and tumblers',
              votes: 1987,
              percentage: 28.3
            },
            cupSleeve: {
              name: 'Cup Sleeve',
              description: 'Adjustable smart sleeve with thermal insulation',
              votes: 1456,
              percentage: 20.7
            },
            babyBottle: {
              name: 'Baby Bottle',
              description: 'Smart baby bottle with feeding tracking',
              votes: 689,
              percentage: 9.8
            }
          },
          totalVotes: 7023,
          lastUpdated: serverTimestamp(),
          isActive: true
        });
      }
    } catch (error) {
      console.error('Initialize public voting error:', error);
    }
  }

  /**
   * Get current voting data
   */
  async getVotingData(type: 'authenticated' | 'public' = 'authenticated'): Promise<VotingData | null> {
    if (!FeatureFlags.FIREBASE) return null;

    try {
      const collection = type === 'authenticated' ? 'products' : 'public';
      const votingDoc = await getDoc(doc(db, 'voting', collection));
      
      if (votingDoc.exists()) {
        return votingDoc.data() as VotingData;
      }
      return null;
    } catch (error) {
      console.error('Get voting data error:', error);
      return null;
    }
  }

  /**
   * Submit authenticated vote (requires user login)
   */
  async submitAuthenticatedVote(productId: string): Promise<{ success: boolean; error?: string }> {
    if (!FeatureFlags.FIREBASE) {
      return { success: false, error: 'Firebase disabled' };
    }

    if (!auth.currentUser) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      // Check if user has already voted
      const userVoteDoc = await getDoc(doc(db, 'userVotes', auth.currentUser.uid));
      if (userVoteDoc.exists()) {
        const userData = userVoteDoc.data();
        if (userData.votedProducts?.includes(productId)) {
          return { success: false, error: 'Already voted for this product' };
        }
      }

      // Get current voting data
      const votingDoc = await getDoc(doc(db, 'voting', 'products'));
      if (!votingDoc.exists()) {
        await this.initializeVoting();
      }

      const votingData = (await getDoc(doc(db, 'voting', 'products'))).data() as VotingData;
      
      if (!votingData.products[productId]) {
        return { success: false, error: 'Invalid product ID' };
      }

      // Update vote count
      const updatedProducts = { ...votingData.products };
      updatedProducts[productId].votes += 1;
      
      // Recalculate percentages
      const totalVotes = votingData.totalVotes + 1;
      Object.keys(updatedProducts).forEach(key => {
        updatedProducts[key].percentage = Number(((updatedProducts[key].votes / totalVotes) * 100).toFixed(1));
      });

      // Update voting document
      await updateDoc(doc(db, 'voting', 'products'), {
        products: updatedProducts,
        totalVotes: totalVotes,
        lastUpdated: serverTimestamp()
      });

      // Record user vote
      const userVotes = userVoteDoc.exists() ? userVoteDoc.data().votedProducts || [] : [];
      await setDoc(doc(db, 'userVotes', auth.currentUser.uid), {
        votedProducts: [...userVotes, productId],
        lastVote: serverTimestamp(),
        userId: auth.currentUser.uid,
        email: auth.currentUser.email
      }, { merge: true });

      // Record vote submission for analytics
      await setDoc(doc(db, 'voteSubmissions', `${auth.currentUser.uid}_${productId}_${Date.now()}`), {
        productId,
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        platform: 'mobile',
        type: 'authenticated'
      });

      return { success: true };
    } catch (error) {
      console.error('Submit authenticated vote error:', error);
      return { success: false, error: 'Failed to submit vote' };
    }
  }

  /**
   * Submit public vote (no authentication required)
   */
  async submitPublicVote(productId: string, fingerprint: string): Promise<{ success: boolean; error?: string }> {
    if (!FeatureFlags.FIREBASE) {
      return { success: false, error: 'Firebase disabled' };
    }

    try {
      // Check if fingerprint has already voted
      const publicVoteDoc = await getDoc(doc(db, 'publicVotes', fingerprint));
      if (publicVoteDoc.exists()) {
        const voteData = publicVoteDoc.data();
        if (voteData.votedProducts?.includes(productId)) {
          return { success: false, error: 'Already voted for this product' };
        }
      }

      // Get current public voting data
      const votingDoc = await getDoc(doc(db, 'voting', 'public'));
      if (!votingDoc.exists()) {
        await this.initializePublicVoting();
      }

      const votingData = (await getDoc(doc(db, 'voting', 'public'))).data() as VotingData;
      
      if (!votingData.products[productId]) {
        return { success: false, error: 'Invalid product ID' };
      }

      // Update vote count
      const updatedProducts = { ...votingData.products };
      updatedProducts[productId].votes += 1;
      
      // Recalculate percentages
      const totalVotes = votingData.totalVotes + 1;
      Object.keys(updatedProducts).forEach(key => {
        updatedProducts[key].percentage = Number(((updatedProducts[key].votes / totalVotes) * 100).toFixed(1));
      });

      // Update public voting document
      await updateDoc(doc(db, 'voting', 'public'), {
        products: updatedProducts,
        totalVotes: totalVotes,
        lastUpdated: serverTimestamp()
      });

      // Record public vote
      const publicVotes = publicVoteDoc.exists() ? publicVoteDoc.data().votedProducts || [] : [];
      await setDoc(doc(db, 'publicVotes', fingerprint), {
        votedProducts: [...publicVotes, productId],
        lastVote: serverTimestamp(),
        fingerprint: fingerprint
      }, { merge: true });

      // Record vote submission for analytics
      await setDoc(doc(db, 'voteSubmissions', `${fingerprint}_${productId}_${Date.now()}`), {
        productId,
        fingerprint,
        timestamp: serverTimestamp(),
        platform: 'mobile',
        type: 'public'
      });

      return { success: true };
    } catch (error) {
      console.error('Submit public vote error:', error);
      return { success: false, error: 'Failed to submit vote' };
    }
  }

  /**
   * Check if user has voted for a specific product
   */
  async hasUserVoted(productId: string): Promise<boolean> {
    if (!FeatureFlags.FIREBASE || !auth.currentUser) return false;

    try {
      const userVoteDoc = await getDoc(doc(db, 'userVotes', auth.currentUser.uid));
      if (userVoteDoc.exists()) {
        const userData = userVoteDoc.data();
        return userData.votedProducts?.includes(productId) || false;
      }
      return false;
    } catch (error) {
      console.error('Check user vote error:', error);
      return false;
    }
  }

  /**
   * Get user's voting history
   */
  async getUserVotingHistory(): Promise<string[]> {
    if (!FeatureFlags.FIREBASE || !auth.currentUser) return [];

    try {
      const userVoteDoc = await getDoc(doc(db, 'userVotes', auth.currentUser.uid));
      if (userVoteDoc.exists()) {
        const userData = userVoteDoc.data();
        return userData.votedProducts || [];
      }
      return [];
    } catch (error) {
      console.error('Get user voting history error:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time voting updates
   */
  subscribeToVotingUpdates(
    callback: (data: VotingData | null) => void,
    type: 'authenticated' | 'public' = 'authenticated'
  ): () => void {
    if (!FeatureFlags.FIREBASE) {
      callback(null);
      return () => {};
    }

    const collection = type === 'authenticated' ? 'products' : 'public';
    const listenerId = `${type}_${Date.now()}`;

    try {
      const unsubscribe = onSnapshot(doc(db, 'voting', collection), (doc) => {
        if (doc.exists()) {
          callback(doc.data() as VotingData);
        } else {
          callback(null);
        }
      });

      this.votingListeners.set(listenerId, unsubscribe);
      return () => {
        unsubscribe();
        this.votingListeners.delete(listenerId);
      };
    } catch (error) {
      console.error('Subscribe to voting updates error:', error);
      callback(null);
      return () => {};
    }
  }

  /**
   * Clean up all voting listeners
   */
  cleanup(): void {
    this.votingListeners.forEach(unsubscribe => unsubscribe());
    this.votingListeners.clear();
  }
}

export default new VotingService();