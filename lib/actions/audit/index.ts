"use server";

import { createClient } from "@/lib/supabase/server";

export async function logAction(orgId: string, action: string, target: string, details: any = {}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return; // Can't log if no user (or system action handling needed)

    try {
        await supabase.from("audit_logs").insert({
            organization_id: orgId,
            actor_id: user.id,
            action: action,
            target_resource: target,
            details: details
        });
    } catch (e) {
        console.error("Failed to log action:", e);
    }
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
