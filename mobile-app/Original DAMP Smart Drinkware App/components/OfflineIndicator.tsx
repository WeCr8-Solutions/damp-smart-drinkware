/**
 * 📶 DAMP Smart Drinkware - Offline Mode Indicators
 * Network connectivity and offline status indicators
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
} from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  strength: number;
}

interface OfflineIndicatorProps {
  style?: any;
  showDetails?: boolean;
  onRetry?: () => void;
}

export default function OfflineIndicator({
  style,
  showDetails = false,
  onRetry,
}: OfflineIndicatorProps) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    strength: 100,
  });
  const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('connected');
  const [queuedActions, setQueuedActions] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-100);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkStatus({
        isConnected: !!state.isConnected,
        isInternetReachable: !!state.isInternetReachable,
        type: state.type,
        strength: state.details?.strength || 100,
      });
    });

    // Check initial status
    NetInfo.fetch().then(state => {
      setNetworkStatus({
        isConnected: !!state.isConnected,
        isInternetReachable: !!state.isInternetReachable,
        type: state.type,
        strength: state.details?.strength || 100,
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Animate indicator when offline
    if (!networkStatus.isConnected || !networkStatus.isInternetReachable) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [networkStatus.isConnected, networkStatus.isInternetReachable]);

  useEffect(() => {
    // Check Firestore connectivity via a lightweight heartbeat doc
    const checkServerConnection = async () => {
      setServerStatus('checking');
      try {
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const db = getFirestore();
        const hb = doc(db, 'metadata', 'heartbeat');
        const snap = await getDoc(hb as any);
        setServerStatus(snap.exists() ? 'connected' : 'disconnected');
        if (snap.exists()) setLastSyncTime(new Date());
      } catch {
        setServerStatus('disconnected');
      }
    };

    const interval = setInterval(checkServerConnection, 30000);
    checkServerConnection();

    return () => clearInterval(interval);
  }, []);

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior
      try {
        const state = await NetInfo.fetch();
        setNetworkStatus({
          isConnected: !!state.isConnected,
          isInternetReachable: !!state.isInternetReachable,
          type: state.type,
          strength: state.details?.strength || 100,
        });

        if (state.isConnected) {
          Alert.alert('Connection Restored', 'Your internet connection is back online.');
        } else {
          Alert.alert('Still Offline', 'Unable to connect to the internet. Please check your network settings.');
        }
      } catch (error) {
        Alert.alert('Connection Error', 'Failed to check network status.');
      }
    }
  };

  const getNetworkIcon = () => {
    if (!networkStatus.isConnected) {
      return <WifiOff size={20} color="#F44336" />;
    }
    return <Wifi size={20} color="#4CAF50" />;
  };

  const getServerIcon = () => {
    switch (serverStatus) {
      case 'connected':
        return <Cloud size={16} color="#4CAF50" />;
      case 'disconnected':
        return <CloudOff size={16} color="#F44336" />;
      case 'checking':
        return <RefreshCw size={16} color="#FF9800" />;
      default:
        return <Cloud size={16} color="#666" />;
    }
  };

  const isOffline = !networkStatus.isConnected || !networkStatus.isInternetReachable;

  if (!isOffline && !showDetails) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: showDetails ? 1 : fadeAnim,
          transform: [{ translateY: showDetails ? 0 : slideAnim }],
        },
      ]}
    >
      {isOffline && (
        <View style={[styles.banner, styles.offlineBanner]}>
          <View style={styles.bannerContent}>
            <AlertTriangle size={20} color="#FFF" />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>You're Offline</Text>
              <Text style={styles.bannerSubtitle}>
                Some features may not work. Changes will sync when connected.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <RefreshCw size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              {getNetworkIcon()}
              <Text style={styles.statusLabel}>Network</Text>
              <Text style={[
                styles.statusValue,
                networkStatus.isConnected ? styles.connectedText : styles.disconnectedText
              ]}>
                {networkStatus.isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>

            <View style={styles.statusItem}>
              {getServerIcon()}
              <Text style={styles.statusLabel}>Server</Text>
              <Text style={[
                styles.statusValue,
                serverStatus === 'connected' ? styles.connectedText :
                serverStatus === 'checking' ? styles.checkingText : styles.disconnectedText
              ]}>
                {serverStatus === 'connected' ? 'Online' :
                 serverStatus === 'checking' ? 'Checking' : 'Offline'}
              </Text>
            </View>
          </View>

          {networkStatus.isConnected && (
            <View style={styles.networkDetails}>
              <Text style={styles.networkType}>
                {networkStatus.type.toUpperCase()}
                {networkStatus.strength < 100 && ` (${networkStatus.strength}%)`}
              </Text>
            </View>
          )}

          {queuedActions > 0 && (
            <View style={styles.queueStatus}>
              <Smartphone size={16} color="#FF9800" />
              <Text style={styles.queueText}>
                {queuedActions} action{queuedActions !== 1 ? 's' : ''} queued for sync
              </Text>
            </View>
          )}

          <View style={styles.syncInfo}>
            <Text style={styles.syncText}>
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

// Connection Status Indicator (minimal version for status bars)
export function ConnectionStatusIndicator() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(!!state.isConnected && !!state.isInternetReachable);
    });

    return unsubscribe;
  }, []);

  if (isConnected) {
    return (
      <View style={styles.miniIndicator}>
        <Wifi size={14} color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={[styles.miniIndicator, styles.miniOffline]}>
      <WifiOff size={14} color="#F44336" />
    </View>
  );
}

// Offline Mode Badge (for use in headers/navigation)
export function OfflineModeBadge() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected || !state.isInternetReachable);
    });

    return unsubscribe;
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.offlineBadge}>
      <WifiOff size={12} color="#FFF" />
      <Text style={styles.offlineBadgeText}>Offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  offlineBanner: {
    backgroundColor: '#F44336',
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  bannerSubtitle: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    opacity: 0.9,
    marginTop: 2,
  },
  retryButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailsContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  connectedText: {
    color: '#4CAF50',
  },
  disconnectedText: {
    color: '#F44336',
  },
  checkingText: {
    color: '#FF9800',
  },
  networkDetails: {
    alignItems: 'center',
    marginBottom: 8,
  },
  networkType: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  queueStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  queueText: {
    fontSize: 12,
    color: '#FF9800',
    fontFamily: 'Inter-Medium',
  },
  syncInfo: {
    alignItems: 'center',
  },
  syncText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  miniIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniOffline: {
    backgroundColor: '#FFEBEE',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
});