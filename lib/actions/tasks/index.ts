"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface KanbanTask {
    id: string;
    organization_id: string;
    assignee_id: string | null;
    title: string;
    description: string | null;
    status: TaskStatus;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    team_id: string | null;
    assignee: {
        first_name: string;
        last_name: string;
        email: string;
        avatar_url: string | null;
    } | null;
    team: {
        id: string;
        name: string;
    } | null;
}

export async function getTasks(orgId: string): Promise<KanbanTask[]> {
    const supabase = createClient();

    const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
            *,
            assignee:profiles!tasks_assignee_id_fkey(
                first_name,
                last_name,
                email,
                avatar_url
            ),
            team:teams(id, name)
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }

    // Supabase typescript workaround for nested references
    return (tasks as any[]).map(task => ({
        ...task,
        assignee: task.assignee || null,
        team: task.team || null
    })) as KanbanTask[];
}

export async function createTask(orgId: string, data: { title: string; description?: string; status?: TaskStatus; assignee_id?: string; team_id?: string; due_date?: string }) {
    const supabase = createClient();

    const { error } = await supabase.from('tasks').insert({
        organization_id: orgId,
        title: data.title,
        description: data.description || null,
        status: data.status || 'TODO',
        assignee_id: data.assignee_id || null,
        team_id: data.team_id || null,
        due_date: data.due_date || null
    });

    if (error) {
        console.error("Error creating task:", error);
        return { error: error.message };
    }

    revalidatePath(`/dashboard/${orgId}`);
    return { success: true };
}

export async function updateTaskStatus(orgId: string, taskId: string, newStatus: TaskStatus) {
    const supabase = createClient();

    const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .eq('organization_id', orgId);

    if (error) {
        console.error("Error updating task status:", error);
        return { error: error.message };
    }

    revalidatePath(`/dashboard/${orgId}`);
    return { success: true };
}

export async function deleteTask(orgId: string, taskId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('organization_id', orgId);

    if (error) {
        console.error("Error deleting task:", error);
        return { error: error.message };
    }

    revalidatePath(`/dashboard/${orgId}`);
    return { success: true };
}

export async function getTaskAssignees(orgId: string) {
    const supabase = createClient();

    const [membersRes, teamsRes] = await Promise.all([
        supabase.from('organization_members')
            .select(`user_id, profiles(first_name, last_name, full_name)`)
            .eq('organization_id', orgId),

        supabase.from('teams')
            .select('*')
            .eq('organization_id', orgId)
    ]);

    const users = (membersRes.data || []).map(m => ({
        id: m.user_id,
        name: m.profiles?.full_name || `${m.profiles?.first_name || ''} ${m.profiles?.last_name || ''}`.trim() || 'Unknown User'
    }));

    return {
        users,
        teams: teamsRes.data || []
    };
}

