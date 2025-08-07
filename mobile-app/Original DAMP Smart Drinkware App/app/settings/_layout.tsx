/**
 * ⚙️ DAMP Smart Drinkware - Settings Section Layout
 * Layout for all settings screens
 */

import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notification Settings',
        }}
      />
    </Stack>
  );
}