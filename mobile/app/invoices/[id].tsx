import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInvoices } from '@/lib/api/invoices';
import { useOrg } from '@/contexts/OrgContext';

export default function InvoiceDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getInvoice, updateInvoiceStatus } = useInvoices();
    const { org } = useOrg();
    const currency = org?.currency || '$';

    const { data: invoice, isLoading, isError } = getInvoice(id as string);

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center">
                <ActivityIndicator size="large" color="#9333ea" />
            </View>
        );
    }

    if (isError || !invoice) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center p-4">
                <Text className="text-slate-600 mb-4">Error loading invoice details.</Text>
                <TouchableOpacity onPress={() => router.back()} className="px-4 py-2 bg-purple-600 rounded-lg">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleStatusChange = async (newStatus: 'draft' | 'paid') => {
        try {
            await updateInvoiceStatus.mutateAsync({ id: invoice.id, status: newStatus });
            if (newStatus === 'draft') {
                // If they revert, it goes back to a quote, so we should jump back to the list
                router.replace('/invoices');
            }
        } catch (error: any) {
            Alert.alert("Error updating status", error.message);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-emerald-100 text-emerald-700';
            case 'invoiced': return 'bg-purple-100 text-purple-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ title: `Invoice #${invoice.number}` }} />
            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-xl font-black text-slate-800 mb-1">{invoice.title}</Text>
                            <Text className="text-sm font-mono text-slate-500">#{invoice.number}</Text>
                        </View>
                        <View className={`px-2 py-1 rounded-md ${getStatusColor(invoice.status).split(' ')[0]}`}>
                            <Text className={`text-[10px] uppercase font-bold ${getStatusColor(invoice.status).split(' ')[1]}`}>
                                {invoice.status}
                            </Text>
                        </View>
                    </View>

                    <View className="bg-slate-50 p-3 rounded-lg flex-row items-center">
                        <Ionicons name="person-outline" size={20} color="#64748b" style={{ marginRight: 8 }} />
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-slate-700">{invoice.clients?.name}</Text>
                            {invoice.clients?.email && <Text className="text-xs text-slate-500">{invoice.clients?.email}</Text>}
                        </View>
                    </View>
                </View>

                {/* Line Items */}
                <View className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
                    <Text className="text-slate-800 font-bold mb-4">Line Items</Text>
                    {invoice.items?.map((item, idx) => (
                        <View key={idx} className="flex-row items-center border-b border-slate-50 py-3">
                            <View className="flex-1">
                                <Text className="font-medium text-slate-800">{item.description}</Text>
                                <Text className="text-xs text-slate-500">{item.quantity} x {currency}{item.unit_price.toFixed(2)}</Text>
                            </View>
                            <Text className="font-bold text-slate-800">{currency}{item.total_price.toFixed(2)}</Text>
                        </View>
                    ))}

                    {invoice.items?.length === 0 && (
                        <Text className="text-slate-400 italic">No line items.</Text>
                    )}

                    <View className="mt-4 pt-4 border-t border-slate-100 flex-row justify-between items-center">
                        <Text className="font-bold text-slate-600">Total Due</Text>
                        <Text className="font-black text-xl text-purple-600">{currency}{invoice.total_amount?.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-8">
                    <Text className="text-slate-800 font-bold mb-4">Actions</Text>

                    {invoice.status === 'invoiced' && (
                        <>
                            <TouchableOpacity onPress={() => handleStatusChange('paid')} className="bg-emerald-600 p-3 rounded-xl items-center flex-row justify-center mb-3">
                                <Ionicons name="cash-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold">Mark as Paid</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleStatusChange('draft')} className="bg-slate-100 border border-slate-200 p-3 rounded-xl items-center flex-row justify-center">
                                <Ionicons name="arrow-undo-outline" size={18} color="#475569" style={{ marginRight: 8 }} />
                                <Text className="text-slate-700 font-bold">Revert to Quote Draft</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {invoice.status === 'paid' && (
                        <>
                            <View className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-3 items-center">
                                <Ionicons name="checkmark-circle" size={32} color="#10b981" className="mb-2" />
                                <Text className="text-emerald-800 font-bold mt-2">Invoice is Paid</Text>
                            </View>
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
