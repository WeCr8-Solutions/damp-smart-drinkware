/**
 * 🧙‍♂️ DAMP Smart Drinkware - Setup Section Layout
 * Layout for onboarding and setup screens
 */

import { Stack } from 'expo-router';

export default function SetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="device-wizard"
        options={{
          title: 'Device Setup Wizard',
        }}
      />
    </Stack>
  );
}