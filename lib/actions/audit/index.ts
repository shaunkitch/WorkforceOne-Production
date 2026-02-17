"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function logAction(
    orgId: string,
    action: string,
    target: string,
    details: any = {},
    meta: {
        tableName?: string;
        recordId?: string;
        previousData?: any;
        newData?: any;
    } = {}
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    try {
        await supabase.from("audit_logs").insert({
            organization_id: orgId,
            actor_id: user.id,
            action: action,
            target_resource: target,
            details: details,
            table_name: meta.tableName,
            record_id: meta.recordId,
            previous_data: meta.previousData,
            new_data: meta.newData
        });
    } catch (e) {
        console.error("Failed to log action:", e);
    }
}

export async function revertChange(logId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch log
    const { data: log, error: logError } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("id", logId)
        .single();

    if (logError || !log) throw new Error("Log not found or access denied");

    // Check permission (Admin only)
    const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", log.organization_id)
        .eq("user_id", user.id)
        .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("Insufficient permissions to revert changes");
    }

    if (!log.table_name || !log.record_id) {
        throw new Error("This action cannot be automatically reverted (missing table/record info).");
    }

    // Revert logic based on Action
    // Action format assumption: "Updated User", "Created Form", etc. 
    // Ideally we'd store a strict 'type' enum like 'UPDATE', 'INSERT', 'DELETE' in 'action' column
    // But 'action' column is currently human readable text sometimes.
    // Let's rely on `previous_data` and `new_data`.

    let revertAction = "";

    // Case 1: Was an INSERT (new_data exists, prev is null) -> DELETE it
    if (log.new_data && !log.previous_data) {
        const { error } = await supabase
            .from(log.table_name)
            .delete()
            .eq("id", log.record_id);

        if (error) throw new Error("Failed to revert (delete): " + error.message);
        revertAction = "REVERT_INSERT";
    }
    // Case 2: Was a DELETE (prev exists, new is null) -> INSERT it back
    else if (log.previous_data && !log.new_data) {
        const { error } = await supabase
            .from(log.table_name)
            .insert(log.previous_data);

        if (error) throw new Error("Failed to revert (restore): " + error.message);
        revertAction = "REVERT_DELETE";
    }
    // Case 3: Was an UPDATE (both exist) -> UPDATE to prev
    else if (log.previous_data && log.new_data) {
        const { error } = await supabase
            .from(log.table_name)
            .update(log.previous_data)
            .eq("id", log.record_id);

        if (error) throw new Error("Failed to revert (update): " + error.message);
        revertAction = "REVERT_UPDATE";
    } else {
        throw new Error("Ambiguous change state, cannot revert safely.");
    }

    // Log the Revert itself
    await logAction(
        log.organization_id,
        `Reverted: ${log.action}`,
        log.target_resource,
        { originalLogId: logId, type: revertAction }
    );

    return { success: true };
}

export async function getAuditLogs(orgId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check permissions handled by RLS (Admin/Owner)

    // Join with Profiles to get actor name
    // Note: audit_logs.actor_id references auth.users. 
    // We can't join auth.users directly easily. 
    // Ideally we join with profiles.

    // Let's assume there's a profile for every user.
    // We will do a manual fetch for profiles or try to join if we set up FK to profiles.
    // The schema I wrote referenced auth.users(id).
    // Let's fetch logs first.

    const { data: logs, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        // If RLS blocks, it returns error.
        throw new Error(error.message);
    }

    // Enhance with user details if possible
    // We can fetch profiles matching the actor_ids
    const actorIds = Array.from(new Set(logs.map(l => l.actor_id).filter(Boolean)));

    if (actorIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, email, full_name").in("id", actorIds);

        return logs.map(log => {
            const profile = profiles?.find(p => p.id === log.actor_id);
            return {
                ...log,
                actor_name: profile?.full_name || profile?.email || "Unknown User",
                actor_email: profile?.email
            };
        });
    }

    return logs;
}
