import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuotes } from '@/lib/api/quotes';
import { useOrg } from '@/contexts/OrgContext';

export default function QuotesIndexScreen() {
    const { quotes, isLoadingQuotes, updateQuoteStatus } = useQuotes();
    const { org } = useOrg();
    const currency = org?.currency || '$';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'sent': return 'bg-blue-100 text-blue-700';
            case 'invoiced': return 'bg-purple-100 text-purple-700';
            case 'paid': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const onRefresh = () => {
        // Handled automatically by query cache on refocus, but could manually refetch if needed
    }

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push('/quotes/create')} className="mr-4">
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

            {isLoadingQuotes ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : (
                <FlatList
                    data={quotes}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    ItemSeparatorComponent={() => <View className="h-4" />}
                    ListEmptyComponent={
                        <View className="bg-white p-8 rounded-2xl items-center justify-center border border-slate-100 border-dashed mt-4">
                            <Ionicons name="document-text-outline" size={48} color="#e2e8f0" />
                            <Text className="text-slate-400 mt-4 text-center">No quotes found.</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/quotes/create')}
                                className="mt-4 bg-blue-50 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-blue-600 font-bold">Create First Quote</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
                            onPress={() => router.push(`/quotes/${item.id}`)}
                        >
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1 mr-2">
                                    <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>{item.title}</Text>
                                    <Text className="text-xs font-mono text-slate-500 mt-1">#{item.number}</Text>
                                </View>
                                <View className={`px-2 py-1 rounded-md ${getStatusColor(item.status).split(' ')[0]}`}>
                                    <Text className={`text-[10px] uppercase font-bold ${getStatusColor(item.status).split(' ')[1]}`}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mt-2 mb-3">
                                <Ionicons name="person" size={12} color="#64748b" style={{ marginRight: 6 }} />
                                <Text className="text-xs text-slate-600 truncate flex-1">{item.clients?.name || 'Unknown Client'}</Text>
                            </View>

                            <View className="flex-row justify-between items-end border-t border-slate-50 pt-3">
                                <Text className="text-xs text-slate-400">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                                <Text className="text-base font-black text-slate-800">
                                    {currency}{item.total_amount?.toFixed(2) || '0.00'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}
