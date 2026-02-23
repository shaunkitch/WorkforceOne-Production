import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuotes } from '@/lib/api/quotes';
import { useOrg } from '@/contexts/OrgContext';

export default function QuoteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getQuote, updateQuoteStatus } = useQuotes();
    const { org } = useOrg();
    const currency = org?.currency || '$';

    const { data: quote, isLoading, isError } = getQuote(id as string);

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (isError || !quote) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center p-4">
                <Text className="text-slate-600 mb-4">Error loading quote details.</Text>
                <TouchableOpacity onPress={() => router.back()} className="px-4 py-2 bg-blue-600 rounded-lg">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleStatusChange = async (newStatus: 'draft' | 'sent' | 'approved' | 'invoiced') => {
        try {
            await updateQuoteStatus.mutateAsync({ id: quote.id, status: newStatus });
        } catch (error: any) {
            Alert.alert("Error updating status", error.message);
        }
    };

    const handleEdit = () => {
        // Optional feature: Send to an edit screen passing the quote ID
        router.push(`/quotes/edit/${quote.id}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'sent': return 'bg-blue-100 text-blue-700';
            case 'invoiced': return 'bg-purple-100 text-purple-700';
            case 'paid': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ title: `Quote #${quote.number}` }} />
            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-xl font-black text-slate-800 mb-1">{quote.title}</Text>
                            <Text className="text-sm font-mono text-slate-500">#{quote.number}</Text>
                        </View>
                        <View className={`px-2 py-1 rounded-md ${getStatusColor(quote.status).split(' ')[0]}`}>
                            <Text className={`text-[10px] uppercase font-bold ${getStatusColor(quote.status).split(' ')[1]}`}>
                                {quote.status}
                            </Text>
                        </View>
                    </View>

                    <View className="bg-slate-50 p-3 rounded-lg flex-row items-center">
                        <Ionicons name="person-outline" size={20} color="#64748b" style={{ marginRight: 8 }} />
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-slate-700">{quote.clients?.name}</Text>
                            {quote.clients?.email && <Text className="text-xs text-slate-500">{quote.clients?.email}</Text>}
                        </View>
                    </View>
                </View>

                {/* Line Items */}
                <View className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
                    <Text className="text-slate-800 font-bold mb-4">Line Items</Text>
                    {quote.items?.map((item, idx) => (
                        <View key={idx} className="flex-row items-center border-b border-slate-50 py-3">
                            <View className="flex-1">
                                <Text className="font-medium text-slate-800">{item.description}</Text>
                                <Text className="text-xs text-slate-500">{item.quantity} x {currency}{item.unit_price.toFixed(2)}</Text>
                            </View>
                            <Text className="font-bold text-slate-800">{currency}{item.total_price.toFixed(2)}</Text>
                        </View>
                    ))}

                    {quote.items?.length === 0 && (
                        <Text className="text-slate-400 italic">No line items.</Text>
                    )}

                    <View className="mt-4 pt-4 border-t border-slate-100 flex-row justify-between items-center">
                        <Text className="font-bold text-slate-600">Total</Text>
                        <Text className="font-black text-xl text-blue-600">{currency}{quote.total_amount?.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-8">
                    <Text className="text-slate-800 font-bold mb-4">Actions</Text>

                    {quote.status === 'draft' && (
                        <>
                            <TouchableOpacity onPress={() => handleStatusChange('sent')} className="bg-blue-600 p-3 rounded-xl items-center flex-row justify-center mb-3">
                                <Ionicons name="paper-plane-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold">Send to Customer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleStatusChange('approved')} className="bg-green-600 p-3 rounded-xl items-center flex-row justify-center mb-3">
                                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold">Approve Directly</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleEdit} className="bg-slate-100 border border-slate-200 p-3 rounded-xl items-center flex-row justify-center">
                                <Ionicons name="create-outline" size={18} color="#475569" style={{ marginRight: 8 }} />
                                <Text className="text-slate-700 font-bold">Edit Quote</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {quote.status === 'sent' && (
                        <>
                            <TouchableOpacity onPress={() => handleStatusChange('approved')} className="bg-green-600 p-3 rounded-xl items-center flex-row justify-center mb-3">
                                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold">Customer Approved</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleStatusChange('draft')} className="bg-slate-100 border border-slate-200 p-3 rounded-xl items-center flex-row justify-center">
                                <Ionicons name="arrow-undo-outline" size={18} color="#475569" style={{ marginRight: 8 }} />
                                <Text className="text-slate-700 font-bold">Revert to Draft</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {quote.status === 'approved' && (
                        <>
                            <TouchableOpacity onPress={() => handleStatusChange('invoiced')} className="bg-purple-600 p-3 rounded-xl items-center flex-row justify-center mb-3">
                                <Ionicons name="receipt-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold">Convert to Invoice</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleStatusChange('draft')} className="bg-slate-100 border border-slate-200 p-3 rounded-xl items-center flex-row justify-center">
                                <Ionicons name="arrow-undo-outline" size={18} color="#475569" style={{ marginRight: 8 }} />
                                <Text className="text-slate-700 font-bold">Revert to Draft</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {(quote.status === 'invoiced' || quote.status === 'paid') && (
                        <>
                            <View className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-3 items-center">
                                <Ionicons name="receipt" size={32} color="#9333ea" className="mb-2" />
                                <Text className="text-purple-800 font-bold mt-2">Quote has been Invoiced</Text>
                                <Text className="text-purple-600 text-xs mt-1">View it in the Invoices tab</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/invoices')} className="bg-purple-600 p-3 rounded-xl items-center flex-row justify-center mb-3">
                                <Text className="text-white font-bold">Go to Invoices</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleStatusChange('draft')} className="bg-slate-100 border border-slate-200 p-3 rounded-xl items-center flex-row justify-center">
                                <Ionicons name="arrow-undo-outline" size={18} color="#475569" style={{ marginRight: 8 }} />
                                <Text className="text-slate-700 font-bold">Revert Status</Text>
                            </TouchableOpacity>
                        </>
                    )}

                </View>

            </ScrollView>
        </View>
    );
}
