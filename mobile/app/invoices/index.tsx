import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInvoices } from '@/lib/api/invoices';
import { useOrg } from '@/contexts/OrgContext';

export default function InvoicesIndexScreen() {
    const { invoices, isLoadingInvoices } = useInvoices();
    const { org } = useOrg();
    const currency = org?.currency || '$';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-emerald-100 text-emerald-700';
            case 'invoiced': return 'bg-purple-100 text-purple-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen
                options={{
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.replace('/(tabs)')} className="ml-4">
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    )
                }}
            />

            {isLoadingInvoices ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#9333ea" />
                </View>
            ) : (
                <FlatList
                    data={invoices}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    ItemSeparatorComponent={() => <View className="h-4" />}
                    ListEmptyComponent={
                        <View className="bg-white p-8 rounded-2xl items-center justify-center border border-slate-100 border-dashed mt-4">
                            <Ionicons name="receipt-outline" size={48} color="#e2e8f0" />
                            <Text className="text-slate-400 mt-4 text-center">No invoices generated yet.</Text>
                            <Text className="text-slate-400 text-xs mt-1 text-center">Convert a Quote into an Invoice from the desktop dashbaord to see it here.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-row items-center"
                            onPress={() => router.push(`/invoices/${item.id}`)}
                        >
                            <View className="w-12 h-12 bg-purple-50 rounded-xl items-center justify-center mr-4 border border-purple-100">
                                <Ionicons name="receipt" size={22} color="#9333ea" />
                            </View>

                            <View className="flex-1">
                                <View className="flex-row justify-between items-start">
                                    <Text className="text-sm font-bold text-slate-800 flex-1 truncate mr-2" numberOfLines={1}>{item.title}</Text>
                                    <View className={`px-2 py-1 rounded-md ${getStatusColor(item.status).split(' ')[0]}`}>
                                        <Text className={`text-[10px] uppercase font-bold ${getStatusColor(item.status).split(' ')[1]}`}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-xs text-slate-500 mt-1">{item.clients?.name || 'Unknown Client'}</Text>
                                <View className="flex-row justify-between items-end mt-2">
                                    <Text className="text-xs text-slate-400">#{item.number}</Text>
                                    <Text className="text-base font-black text-slate-800">{currency}{item.total_amount?.toFixed(2) || '0.00'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}
