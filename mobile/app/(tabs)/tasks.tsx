import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useOrg } from '@/contexts/OrgContext';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export default function TasksScreen() {
    const { org, isOnline } = useOrg();
    const queryClient = useQueryClient();

    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');

    const fetchTasks = async () => {
        if (!org?.id) return [];
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                assignee:profiles!tasks_assignee_id_fkey(first_name, last_name, avatar_url),
                team:teams(id, name),
                form:forms(id, title)
            `)
            .eq('organization_id', org.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
        return data || [];
    };

    const { data: tasks, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['tasks', org?.id],
        queryFn: fetchTasks,
        enabled: !!org?.id,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) => {
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', taskId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', org?.id] });
        },
        onError: (error) => {
            Alert.alert('Error', 'Failed to update task status: ' + error.message);
        }
    });

    const handleTaskPress = (task: any) => {
        if (task.form_id) {
            // It has a form. We should mark it as IN_PROGRESS if it's currently TODO, then open the form.
            if (task.status === 'TODO') {
                updateStatusMutation.mutate({ taskId: task.id, newStatus: 'IN_PROGRESS' });
            }
            router.push({
                pathname: '/form_entry',
                params: {
                    formId: task.form_id,
                    formName: task.form?.title || 'Operational Form',
                    taskId: task.id // Pass the taskId so form_entry can mark it DONE
                }
            });
        } else {
            // No form. Just show status action sheet.
            handleUpdateStatus(task);
        }
    };

    const handleUpdateStatus = (task: any) => {
        Alert.alert(
            "Update Task Status",
            "Select a new status for this task:",
            [
                { text: "To Do", onPress: () => updateStatusMutation.mutate({ taskId: task.id, newStatus: 'TODO' }) },
                { text: "In Progress", onPress: () => updateStatusMutation.mutate({ taskId: task.id, newStatus: 'IN_PROGRESS' }) },
                { text: "Done", onPress: () => updateStatusMutation.mutate({ taskId: task.id, newStatus: 'DONE' }) },
                { text: "Cancel", style: "cancel" }
            ],
            { cancelable: true }
        );
    };

    const filteredTasks = tasks?.filter((t: any) => filterStatus === 'ALL' || t.status === filterStatus) || [];

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'TODO': return '#64748b';
            case 'IN_PROGRESS': return '#eab308';
            case 'DONE': return '#22c55e';
            default: return '#cbd5e1';
        }
    };

    const renderTask = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white p-4 mb-3 rounded-xl mx-4 shadow-sm border border-slate-100"
            onPress={() => handleTaskPress(item)}
            activeOpacity={0.7}
        >
            <View className="flex-row justify-between flex-wrap items-start space-x-2">
                <Text className="text-base font-bold text-slate-800 flex-1">{item.title}</Text>
                <View className="px-2 py-1 rounded-md" style={{ backgroundColor: getStatusColor(item.status) + '20' }}>
                    <Text className="text-xs font-bold" style={{ color: getStatusColor(item.status) }}>
                        {item.status.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            {item.description ? (
                <Text className="text-sm text-slate-500 mt-2 line-clamp-2">{item.description}</Text>
            ) : null}

            <View className="flex-row flex-wrap items-center mt-3 pt-3 border-t border-slate-50 gap-2">
                {item.assignee && (
                    <View className="flex-row items-center bg-slate-100 px-2 py-1 rounded-full">
                        <Ionicons name="person" size={12} color="#64748b" />
                        <Text className="text-xs text-slate-600 ml-1">{item.assignee.first_name} {item.assignee.last_name}</Text>
                    </View>
                )}
                {item.team && (
                    <View className="flex-row items-center bg-indigo-50 px-2 py-1 rounded-full">
                        <Ionicons name="people" size={12} color="#4f46e5" />
                        <Text className="text-xs text-indigo-700 ml-1">{item.team.name}</Text>
                    </View>
                )}
                {item.form && (
                    <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-full">
                        <Ionicons name="document-text" size={12} color="#d97706" />
                        <Text className="text-xs text-amber-700 ml-1 truncate max-w-[120px]" numberOfLines={1}>{item.form.title}</Text>
                    </View>
                )}
                {!item.assignee && !item.team && (
                    <Text className="text-xs text-slate-400 italic">Unassigned</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <LinearGradient
                colors={org?.brand_color ? [org.brand_color, org.brand_color] : ['#1e40af', '#2563eb']}
                className="pt-16 pb-8 px-6 rounded-b-3xl shadow-lg"
                end={{ x: 0.5, y: 1 }}
                start={{ x: 0.5, y: 0 }}
            >
                <Text className="text-3xl font-bold text-white mb-2">Operational Tasks</Text>
                <Text className="text-blue-100 text-sm font-medium">Your assigned action items</Text>
            </LinearGradient>

            <View className="px-6 py-4 -mt-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
                        <TouchableOpacity
                            key={status}
                            onPress={() => setFilterStatus(status as any)}
                            className={`px-4 py-2 rounded-full mr-2 ${filterStatus === status ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                            <Text className={`text-sm font-semibold ${filterStatus === status ? 'text-white' : 'text-slate-600'}`}>
                                {status.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : (
                <FlatList
                    data={filteredTasks}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTask}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                    ListEmptyComponent={
                        <View className="items-center mt-20 px-8">
                            <Ionicons name="checkmark-done-circle-outline" size={64} color="#cbd5e1" />
                            <Text className="text-lg font-bold text-slate-600 mt-4 text-center">No Tasks Found</Text>
                            <Text className="text-sm text-slate-400 text-center mt-2">
                                Check back later or adjust your status filters.
                            </Text>
                        </View>
                    }
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
                />
            )}
        </View>
    );
}
