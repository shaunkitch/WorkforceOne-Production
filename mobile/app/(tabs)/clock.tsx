import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useOrg } from '@/contexts/OrgContext';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

// Simple Haversine implementation if geolib not available
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}

export default function ClockScreen() {
    const { org } = useOrg(); // Get current org
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [sites, setSites] = useState<any[]>([]);
    const [nearestSite, setNearestSite] = useState<any | null>(null);
    const [distanceToSite, setDistanceToSite] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [clocking, setClocking] = useState(false);
    const [currentEntry, setCurrentEntry] = useState<any | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Initial Load
    useEffect(() => {
        if (org) {
            loadData();
        }
    }, [org]);

    // Location Watcher (Run once on mount)
    useEffect(() => {
        let subscriber: Location.LocationSubscription;

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Get initial location immediately if possible
            const currentLoc = await Location.getCurrentPositionAsync({});
            setLocation(currentLoc);

            subscriber = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
                (loc) => {
                    setLocation(loc);
                }
            );
        })();

        return () => {
            if (subscriber) subscriber.remove();
        };
    }, []);

    // Recalculate Nearest Site whenever Location or Sites change
    useEffect(() => {
        if (!location || !sites || sites.length === 0) return;

        let minDist = Infinity;
        let closest = null;

        sites.forEach(site => {
            if (site.latitude && site.longitude) {
                const dist = calculateDistance(
                    location.coords.latitude,
                    location.coords.longitude,
                    site.latitude,
                    site.longitude
                );
                if (dist < minDist) {
                    minDist = dist;
                    closest = site;
                }
            }
        });

        setNearestSite(closest);
        setDistanceToSite(minDist);
    }, [location, sites]);

    const loadData = async () => {
        if (!org) return;
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Sites for current Org
            const { data: mySites, error: sitesError } = await supabase
                .from('sites')
                .select('*')
                .eq('organization_id', org.id);

            if (sitesError) {
                console.error("Error fetching sites:", sitesError);
                Alert.alert("Error", "Failed to load sites.");
            }
            if (mySites) {
                console.log("Loaded sites:", mySites.length);
                setSites(mySites);
            }

            // 2. Fetch active time entry
            const { data: activeEntry, error: entryError } = await supabase
                .from('time_entries')
                .select('*')
                .eq('user_id', user.id)
                .is('clock_out', null)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle(); // Changed from single() to maybeSingle() to avoid 406 if no entry

            if (!entryError && activeEntry) {
                setCurrentEntry(activeEntry);
            } else {
                setCurrentEntry(null);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };



    const handleClockAction = async () => {
        if (clocking) return;
        setClocking(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            if (currentEntry) {
                // CLOCK OUT
                const { error } = await supabase
                    .from('time_entries')
                    .update({
                        clock_out: new Date().toISOString(),
                        // Optionally calculated duration DB trigger or here
                    })
                    .eq('id', currentEntry.id);

                if (error) throw error;
                Alert.alert("Success", "Clocked Out!");
                setCurrentEntry(null);

            } else {
                // CLOCK IN
                // Validate Geofence
                if (!nearestSite) {
                    Alert.alert("Error", "No sites loaded.");
                    return;
                }
                if (distanceToSite! > nearestSite.radius) {
                    Alert.alert("Outside Geofence", `You are ${Math.round(distanceToSite!)}m away from ${nearestSite.name}. Must be within ${nearestSite.radius}m.`);
                    return;
                }

                const { data, error } = await supabase
                    .from('time_entries')
                    .insert({
                        user_id: user.id,
                        organization_id: nearestSite.organization_id, // Important
                        clock_in: new Date().toISOString(),
                        location: {
                            latitude: location?.coords.latitude,
                            longitude: location?.coords.longitude,
                            accuracy: location?.coords.accuracy
                        },
                        notes: `Clocked in at ${nearestSite.name}`
                    })
                    .select()
                    .single();

                if (error) throw error;
                Alert.alert("Success", `Clocked In at ${nearestSite.name}!`);
                setCurrentEntry(data);
            }
        } catch (e: any) {
            Alert.alert("Error", e.message);
        } finally {
            setClocking(false);
        }
    };

    if (loading && !sites.length) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    const isWithinRange = nearestSite && distanceToSite !== null && distanceToSite <= nearestSite.radius;

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar style="light" />
            {/* Header Area */}
            <LinearGradient
                colors={org?.brand_color ? [org.brand_color, org.brand_color] : ['#1e40af', '#2563eb']}
                className="pt-16 pb-8 px-6 rounded-b-3xl shadow-lg"
                end={{ x: 0.5, y: 1 }}
                start={{ x: 0.5, y: 0 }}
            >
                <Text className="text-3xl font-bold text-white mb-2">Time & Attendance</Text>
                <Text className="text-blue-100 text-sm font-medium">Clock In/Out Management</Text>
            </LinearGradient>

            <ScrollView
                className="flex-1 px-6 -mt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* STATUS CARD */}
                <View className={`p-6 rounded-2xl mb-6 shadow-sm border ${currentEntry ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}>
                    <Text className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">Current Status</Text>
                    <Text className="text-3xl font-black text-slate-900">
                        {currentEntry ? "CLOCKED IN" : "CLOCKED OUT"}
                    </Text>
                    {currentEntry && (
                        <Text className="text-slate-600 mt-2 font-medium">
                            Since: {new Date(currentEntry.clock_in).toLocaleTimeString()}
                        </Text>
                    )}
                </View>

                {/* LOCATION CARD */}
                <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-row items-center mb-6">
                    <View className="w-12 h-12 bg-slate-50 rounded-xl items-center justify-center mr-4">
                        <Ionicons name="location" size={24} color="#64748b" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-slate-800 text-base">
                            {nearestSite ? nearestSite.name : "Searching for sites..."}
                        </Text>
                        {nearestSite && (
                            <Text className={`mt-1 font-medium text-sm ${isWithinRange ? 'text-green-600' : 'text-red-500'}`}>
                                {Math.round(distanceToSite || 0)}m away (Radius: {nearestSite.radius}m)
                            </Text>
                        )}
                        {!nearestSite && location && (
                            <Text className="text-slate-500 text-sm mt-1">
                                GPS: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                            </Text>
                        )}
                    </View>
                </View>

                {/* ACTION BUTTON */}
                <TouchableOpacity
                    className={`flex-row w-full p-4 rounded-xl items-center justify-center shadow-md mb-4
                        ${currentEntry ? 'bg-red-500 shadow-red-500/20' : 'bg-blue-600 shadow-blue-600/20'}
                    `}
                    onPress={handleClockAction}
                >
                    {clocking ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name={currentEntry ? "log-out-outline" : "log-in-outline"} size={22} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-white text-lg font-bold tracking-wide">
                                {currentEntry ? "CLOCK OUT" : "CLOCK IN"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {!currentEntry && !isWithinRange && nearestSite && (
                    <Text className="text-red-500 text-sm font-medium text-center px-4">
                        You must be within range of a site to clock in.
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}
