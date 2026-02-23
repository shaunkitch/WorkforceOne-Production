import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { useInventory } from '@/lib/api/inventory';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function CreateInventoryScreen() {
    const { createInventoryItem } = useInventory();

    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [location, setLocation] = useState('');
    const [barcode, setBarcode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const handleCreate = async () => {
        if (!sku || !name || !quantity) {
            Alert.alert("Missing Fields", "SKU, Name, and Quantity are required.");
            return;
        }

        try {
            await createInventoryItem.mutateAsync({
                sku,
                name,
                description,
                quantity: parseInt(quantity, 10) || 0,
                location,
                barcode
            });
            router.back();
        } catch (err: any) {
            Alert.alert("Error Adding Item", err.message);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleCreate}
                            className="mr-4 bg-emerald-600 px-4 py-1.5 rounded-full"
                            disabled={createInventoryItem.isPending}
                        >
                            {createInventoryItem.isPending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text className="text-white font-bold">Save Item</Text>
                            )}
                        </TouchableOpacity>
                    ),
                }}
            />
            <ScrollView className="p-4" keyboardShouldPersistTaps="handled">

                <View className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-6">
                    <Text className="text-slate-800 font-bold mb-4 text-base">Core Details</Text>

                    <Text className="text-slate-600 font-medium mb-1 text-xs">SKU *</Text>
                    <TextInput
                        value={sku}
                        onChangeText={setSku}
                        placeholder="e.g. WIDGET-001"
                        autoCapitalize="characters"
                        className="border border-slate-200 rounded-lg p-3 text-slate-800 bg-slate-50 mb-4 font-mono"
                    />

                    <Text className="text-slate-600 font-medium mb-1 text-xs">Item Name *</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Security Camera Array"
                        className="border border-slate-200 rounded-lg p-3 text-slate-800 bg-slate-50 mb-4"
                    />

                    <Text className="text-slate-600 font-medium mb-1 text-xs">Initial Quantity *</Text>
                    <TextInput
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="number-pad"
                        className="border border-slate-200 rounded-lg p-3 text-slate-800 bg-slate-50 mb-4 font-bold text-lg"
                    />
                </View>

                <View className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-6 relative">
                    <View className="absolute top-0 right-0 p-3 pt-5">
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Optional</Text>
                    </View>

                    <Text className="text-slate-800 font-bold mb-4 text-base">Tracking & Logistics</Text>

                    <Text className="text-slate-600 font-medium mb-1 text-xs">Location</Text>
                    <TextInput
                        value={location}
                        onChangeText={setLocation}
                        placeholder="e.g. Warehouse A, Aisle 3"
                        className="border border-slate-200 rounded-lg p-3 text-slate-800 bg-slate-50 mb-4"
                    />

                    <Text className="text-slate-600 font-medium mb-1 text-xs">Barcode / Serial</Text>
                    <View className="flex-row items-center mb-4">
                        <TextInput
                            value={barcode}
                            onChangeText={setBarcode}
                            placeholder="Scan or type barcode"
                            className="flex-1 border border-slate-200 rounded-l-lg p-3 text-slate-800 bg-slate-50"
                        />
                        <TouchableOpacity
                            onPress={async () => {
                                if (!permission?.granted) {
                                    const { granted } = await requestPermission();
                                    if (!granted) {
                                        Alert.alert("Permission required", "Camera permission is required to scan barcodes.");
                                        return;
                                    }
                                }
                                setIsScanning(true);
                            }}
                            className="bg-blue-600 p-3 rounded-r-lg border border-blue-600 justify-center items-center"
                        >
                            <Ionicons name="barcode-outline" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-slate-600 font-medium mb-1 text-xs">Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add notes..."
                        multiline
                        numberOfLines={3}
                        className="border border-slate-200 rounded-lg p-3 text-slate-800 bg-slate-50 min-h-[80px]"
                        style={{ textAlignVertical: 'top' }}
                    />
                </View>

            </ScrollView>

            <Modal visible={isScanning} animationType="slide" onRequestClose={() => setIsScanning(false)}>
                <View className="flex-1 bg-black">
                    <CameraView
                        style={{ flex: 1 }}
                        facing="back"
                        onBarcodeScanned={({ data }) => {
                            setBarcode(data);
                            setIsScanning(false);
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => setIsScanning(false)}
                        className="absolute top-12 right-6 bg-black/50 p-2 rounded-full z-10"
                    >
                        <Ionicons name="close" size={32} color="white" />
                    </TouchableOpacity>
                    <View className="absolute bottom-12 left-0 right-0 items-center">
                        <View className="bg-black/60 px-4 py-2 rounded-full">
                            <Text className="text-white font-medium">Position barcode within frame</Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
