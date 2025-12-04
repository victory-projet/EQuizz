import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="page1" />
            <Stack.Screen name="page2" />
            <Stack.Screen name="page3"/>
        </Stack>
    );
}
