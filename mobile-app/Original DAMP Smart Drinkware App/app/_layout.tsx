import { useEffect, useState, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/contexts/AuthContext';
import { auth } from '@/firebase/config';
import { User } from 'firebase/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    // Listen for auth changes with Firebase
    let unsubscribe: (() => void) | null = null;

    const setupAuthListener = () => {
      try {
        if (auth && typeof auth.onAuthStateChanged === 'function') {
          unsubscribe = auth.onAuthStateChanged((user) => {
            if (mounted.current) {
              setUser(user);
              setIsLoading(false);
            }
          });
        } else {
          // Fallback if auth is not ready yet
          setTimeout(() => {
            if (mounted.current) {
              setUser(null);
              setIsLoading(false);
            }
          }, 1000);
        }
      } catch (error) {
        console.warn('Auth listener setup failed:', error);
        if (mounted.current) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    // Set up auth listener
    setupAuthListener();

    return () => {
      mounted.current = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {session ? (
              <>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="subscription" />
              </>
            ) : (
              <Stack.Screen name="auth" />
            )}
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}