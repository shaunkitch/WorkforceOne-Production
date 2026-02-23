import { Stack } from 'expo-router';

export default function InventoryLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Inventory', headerShown: true }} />
            <Stack.Screen name="create" options={{ title: 'Add Item', presentation: 'modal', headerShown: true }} />
        </Stack>
    );
}
