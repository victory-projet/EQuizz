import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack>
    <Stack.Screen name="index" options={{title:"Accueil"}}></Stack.Screen>
    <Stack.Screen name="RegisterScreen" options={{title:"INSCRIPTION"}}></Stack.Screen>
    <Stack.Screen name="LoginScreen" options={{title:"CONNEXION"}}></Stack.Screen>
  </Stack>;
}
