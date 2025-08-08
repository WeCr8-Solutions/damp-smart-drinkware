/**
 * 🗳️ DAMP Smart Drinkware - Product Voting Screen
 * Cross-platform voting system matching website functionality
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { VotingService } from '@/lib';
import type { VotingData, ProductVote } from '@/services/voting-service';

interface ProductVoteCardProps {
  productId: string;
  product: ProductVote;
  hasVoted: boolean;
  onVote: (productId: string) => Promise<void>;
  isVoting: boolean;
}

function ProductVoteCard({ productId, product, hasVoted, onVote, isVoting }: ProductVoteCardProps) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPercentage}>{product.percentage}%</Text>
      </View>
      
      <Text style={styles.productDescription}>{product.description}</Text>
      
      <View style={styles.voteSection}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${product.percentage}%` }
            ]} 
          />
        </View>
        
        <View style={styles.voteInfo}>
          <Text style={styles.voteCount}>{product.votes.toLocaleString()} votes</Text>
          
          <TouchableOpacity
            style={[
              styles.voteButton,
              hasVoted && styles.voteButtonDisabled,
              isVoting && styles.voteButtonLoading
            ]}
            onPress={() => onVote(productId)}
            disabled={hasVoted || isVoting}
          >
            {isVoting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={[
                styles.voteButtonText,
                hasVoted && styles.voteButtonTextDisabled
              ]}>
                {hasVoted ? 'Voted' : 'Vote'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function VotingScreen() {
  const { user } = useAuth();
  const [votingData, setVotingData] = useState<VotingData | null>(null);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [votingProductId, setVotingProductId] = useState<string | null>(null);

  useEffect(() => {
    loadVotingData();
    loadUserVotes();

    // Subscribe to real-time updates
    const unsubscribe = VotingService.subscribeToVotingUpdates(
      (data) => {
        setVotingData(data);
        setLoading(false);
      },
      'authenticated'
    );

    return unsubscribe;
  }, []);

  const loadVotingData = async () => {
    try {
      const data = await VotingService.getVotingData('authenticated');
      setVotingData(data);
    } catch (error) {
      console.error('Load voting data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    try {
      const votes = await VotingService.getUserVotingHistory();
      setUserVotes(votes);
    } catch (error) {
      console.error('Load user votes error:', error);
    }
  };

  const handleVote = async (productId: string) => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to vote for your favorite products.',
        [{ text: 'OK' }]
      );
      return;
    }

    setVotingProductId(productId);

    try {
      const result = await VotingService.submitAuthenticatedVote(productId);
      
      if (result.success) {
        setUserVotes(prev => [...prev, productId]);
        Alert.alert(
          'Vote Submitted!',
          'Thank you for voting! Your voice helps us prioritize which products to develop first.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Vote Failed',
          result.error || 'Unable to submit your vote. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Vote error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setVotingProductId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadVotingData(),
      loadUserVotes()
    ]);
    setRefreshing(false);
  };

  if (loading && !votingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading voting data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Vote for Next Product</Text>
          <Text style={styles.subtitle}>
            Help us decide which DAMP Smart Drinkware product to develop first!
          </Text>
          {votingData && (
            <Text style={styles.totalVotes}>
              Total votes: {votingData.totalVotes.toLocaleString()}
            </Text>
          )}
        </View>

        {!user && (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>
              🔐 Log in to vote and help shape our product roadmap!
            </Text>
          </View>
        )}

        {votingData?.products ? (
          Object.entries(votingData.products)
            .sort(([, a], [, b]) => b.votes - a.votes)
            .map(([productId, product]) => (
              <ProductVoteCard
                key={productId}
                productId={productId}
                product={product}
                hasVoted={userVotes.includes(productId)}
                onVote={handleVote}
                isVoting={votingProductId === productId}
              />
            ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No voting data available at the moment.
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your votes help us prioritize development and bring you the products you want most!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  totalVotes: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  loginPrompt: {
    margin: 20,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  loginPromptText: {
    fontSize: 16,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '500',
  },
  productCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  productPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  voteSection: {
    gap: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  voteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  voteButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  voteButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  voteButtonLoading: {
    backgroundColor: '#007AFF',
  },
  voteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  voteButtonTextDisabled: {
    color: '#999',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});