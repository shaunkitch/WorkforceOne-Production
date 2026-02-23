import { Stack } from 'expo-router';

export default function QuotesLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Quotes', headerShown: true }} />
            <Stack.Screen name="create" options={{ title: 'New Quote', presentation: 'modal', headerShown: true }} />
        </Stack>
    );
}
