import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuotes, QuoteItem } from '@/lib/api/quotes';
import { useClients } from '@/lib/api/clients';
import { useInventory } from '@/lib/api/inventory';
import { useOrg } from '@/contexts/OrgContext';

export default function EditQuoteScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getQuote, updateQuote } = useQuotes();
    const { data: quote, isLoading: isLoadingQuote } = getQuote(id as string);
    const { clients, isLoadingClients } = useClients();
    const { inventory, isLoadingInventory } = useInventory();
    const { org } = useOrg();
    const currency = org?.currency || '$';

    const [title, setTitle] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [items, setItems] = useState<QuoteItem[]>([]);

    // Item drafts
    const [desc, setDesc] = useState('');
    const [qty, setQty] = useState('1');
    const [price, setPrice] = useState('');

    useEffect(() => {
        if (quote) {
            setTitle(quote.title);
            setSelectedClientId(quote.client_id);
            setItems(quote.items || []);
        }
    }, [quote]);

    const handleAddItem = () => {
        if (!desc || !price) return;
        const q = parseInt(qty) || 1;
        const p = parseFloat(price) || 0;

        setItems([...items, {
            description: desc,
            quantity: q,
            unit_price: p,
            total_price: q * p
        }]);

        setDesc('');
        setQty('1');
        setPrice('');
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleUpdate = async () => {
        if (!title || !selectedClientId) {
            Alert.alert("Missing Fields", "Please select a client and enter a title.");
            return;
        }

        try {
            await updateQuote.mutateAsync({
                id: quote!.id,
                title,
                clientId: selectedClientId,
                items
            });
            router.back();
        } catch (err: any) {
            Alert.alert("Error Updating Quote", err.message);
        }
    };

    const total = items.reduce((sum, item) => sum + item.total_price, 0);

    if (isLoadingQuote) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen
                options={{
                    title: `Edit Quote #${quote?.number || ''}`,
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleUpdate}
                            className="mr-4 bg-blue-600 px-4 py-1.5 rounded-full"
                            disabled={updateQuote.isPending}
                        >
                            {updateQuote.isPending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text className="text-white font-bold">Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    ),
                }}
            />
            <ScrollView className="p-4" keyboardShouldPersistTaps="handled">
                {/* Quote Details */}
                <View className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
                    <Text className="text-slate-800 font-bold mb-2">Quote Details</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Quote Title (e.g. Website Redesign)"
                        className="border border-slate-200 rounded-lg p-3 text-slate-800 bg-slate-50 mb-4"
                    />
                    <Text className="text-slate-600 font-medium mb-2 text-sm">Select Client</Text>
                    {isLoadingClients ? (
                        <ActivityIndicator size="small" color="#2563eb" className="self-start" />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                            {clients.map(client => (
                                <TouchableOpacity
                                    key={client.id}
                                    onPress={() => setSelectedClientId(client.id)}
                                    className={`px-4 py-2 rounded-full border mr-2 transition-colors ${selectedClientId === client.id ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
                                        }`}
                                >
                                    <Text className={selectedClientId === client.id ? 'text-white font-medium' : 'text-slate-600'}>
                                        {client.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            {clients.length === 0 && <Text className="text-slate-400">No clients found.</Text>}
                        </ScrollView>
                    )}
                </View>

                {/* Line Items */}
                <View className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
                    <Text className="text-slate-800 font-bold mb-4">Line Items</Text>

                    {items.map((item, idx) => (
                        <View key={idx} className="flex-row items-center border-b border-slate-100 py-3 mb-2">
                            <View className="flex-1">
                                <Text className="font-medium text-slate-800">{item.description}</Text>
                                <Text className="text-xs text-slate-500">{item.quantity} x {currency}{item.unit_price.toFixed(2)}</Text>
                            </View>
                            <Text className="font-bold text-slate-800 mr-4">{currency}{item.total_price.toFixed(2)}</Text>
                            <TouchableOpacity onPress={() => removeItem(idx)}>
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Add New Item */}
                    <Text className="text-slate-800 font-bold mt-2 mb-2">Add New Item</Text>

                    {/* Inventory Quick Select */}
                    <Text className="text-slate-500 font-medium mb-2 text-xs">Quick Add from Inventory</Text>
                    {isLoadingInventory ? (
                        <ActivityIndicator size="small" color="#2563eb" className="self-start mb-4" />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                            {inventory.map(invItem => (
                                <TouchableOpacity
                                    key={invItem.id}
                                    onPress={() => setDesc(`[${invItem.sku}] ${invItem.name}`)}
                                    className="px-3 py-1.5 rounded-full border mr-2 bg-white border-slate-200"
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="cube-outline" size={14} color="#64748b" style={{ marginRight: 4 }} />
                                        <Text className="text-slate-600 text-sm">
                                            {invItem.name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {inventory.length === 0 && <Text className="text-slate-400 text-sm italic">No inventory available.</Text>}
                        </ScrollView>
                    )}

                    <View className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                        <TextInput
                            value={desc}
                            onChangeText={setDesc}
                            placeholder="Item Description"
                            className="bg-white border border-slate-200 rounded p-2 mb-2"
                        />
                        <View className="flex-row space-x-2">
                            <TextInput
                                value={qty}
                                onChangeText={setQty}
                                keyboardType="numeric"
                                placeholder="Qty"
                                className="flex-1 bg-white border border-slate-200 rounded p-2"
                            />
                            <TextInput
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="decimal-pad"
                                placeholder={`Unit Price ${currency}`}
                                className="flex-2 bg-white border border-slate-200 rounded p-2 px-6"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={handleAddItem}
                            className="bg-slate-800 items-center py-3 rounded-lg mt-3"
                        >
                            <Text className="text-white font-bold text-sm">Add Item</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Total Summary */}
                <View className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-10 items-center justify-between flex-row">
                    <Text className="text-blue-800 font-bold text-lg">Total Amount</Text>
                    <Text className="text-blue-900 font-black text-2xl">{currency}{total.toFixed(2)}</Text>
                </View>

            </ScrollView>
        </View>
    );
}
