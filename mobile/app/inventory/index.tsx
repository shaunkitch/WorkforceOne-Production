import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '@/lib/api/inventory';

export default function InventoryIndexScreen() {
    const { inventory, isLoadingInventory } = useInventory();

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push('/inventory/create')} className="mr-4">
                            <Ionicons name="add-circle" size={28} color="#2563eb" />
                        </TouchableOpacity>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.replace('/(tabs)')} className="ml-4">
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    )
                }}
            />

            {isLoadingInventory ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : (
                <FlatList
                    data={inventory}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    ItemSeparatorComponent={() => <View className="h-4" />}
                    ListEmptyComponent={
                        <View className="bg-white p-8 rounded-2xl items-center justify-center border border-slate-100 border-dashed mt-4">
                            <Ionicons name="cube-outline" size={48} color="#e2e8f0" />
                            <Text className="text-slate-400 mt-4 text-center">No inventory items found.</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/inventory/create')}
                                className="mt-4 bg-blue-50 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-blue-600 font-bold">Add First Item</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-row items-center"
                            onPress={() => {
                                // Future Item Detail Screen...
                            }}
                        >
                            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 border ${item.quantity <= 5 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
                                <Ionicons name="cube" size={24} color={item.quantity <= 5 ? '#ef4444' : '#64748b'} />
                            </View>

                            <View className="flex-1">
                                <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>{item.name}</Text>
                                <Text className="text-xs text-slate-500 font-mono mt-1">SKU: {item.sku}</Text>

                                {item.location && (
                                    <View className="flex-row items-center mt-2">
                                        <Ionicons name="location" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
                                        <Text className="text-xs text-slate-500">{item.location}</Text>
                                    </View>
                                )}
                            </View>

                            <View className="items-end">
                                <Text className="text-xs text-slate-500 mb-1">Stock</Text>
                                <Text className={`text-xl font-black ${item.quantity <= 5 ? 'text-red-500' : 'text-slate-800'}`}>
                                    {item.quantity}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}
