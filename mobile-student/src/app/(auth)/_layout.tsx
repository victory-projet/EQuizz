import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Views/RegisterScreen" />
      <Stack.Screen name="Views/LoginScreen" />
    </Stack>
  );
}
