/**
 * 👤 DAMP Smart Drinkware - Account Section Layout
 * Layout for all account-related screens
 */

import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="subscription"
        options={{
          title: 'Subscription Management',
        }}
      />
      <Stack.Screen
        name="payment-methods"
        options={{
          title: 'Payment Methods',
        }}
      />
      <Stack.Screen
        name="billing-history"
        options={{
          title: 'Billing History',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile Settings',
        }}
      />
    </Stack>
  );
}