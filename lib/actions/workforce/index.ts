"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";

export async function createTeam(orgId: string, name: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await supabase.from("teams").insert({
        organization_id: orgId,
        name: name
    });

    revalidatePath(`/dashboard/${orgId}/users/teams`);
}

import { Team } from "@/types/app";

export async function getTeams(orgId: string): Promise<Team[]> {
    const supabase = createClient();

    const { data: teams } = await supabase
        .from("teams")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

    return (teams as Team[]) || [];
}

export async function getTeamMembers(teamId: string) {
    const supabase = createClient();
    // Assuming we can join profiles through user_id
    const { data: members } = await supabase
        .from("team_members")
        .select("*, profiles(*)")
        .eq("team_id", teamId);

    return members || [];
}

import { BankDetails } from "@/types/app";

// Extended User Creation
export async function createUser(orgId: string, data: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    role: "admin" | "editor" | "viewer";
    teamId?: string;
    hourlyRate?: number;
    bankDetails?: BankDetails;
}) {
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error("Unauthorized");

    // ... (rest of function)
}

export async function updateUser(orgId: string, userId: string, data: {
    firstName: string;
    lastName: string;
    mobile: string;
    email?: string;
    role: "admin" | "editor" | "viewer";
    teamId?: string | null;
    hourlyRate?: number;
    bankDetails?: BankDetails;
}) {
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error("Unauthorized");

    // Check permissions (Only admins/owners can edit users)
    const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", orgId)
        .eq("user_id", currentUser.id)
        .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("Insufficient permissions to update users");
    }

    // Fetch previous state for Audit Log
    const { data: previousProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    const adminSupabase = createAdminClient();

    // 1. Update Auth Email (if changed)
    if (data.email) {
        const { error: authError } = await adminSupabase.auth.admin.updateUserById(userId, {
            email: data.email,
            email_confirm: true
        });
        if (authError) throw new Error("Failed to update auth email: " + authError.message);
    }

    const { error: profileError } = await adminSupabase
        .from("profiles")
        .update({
            full_name: `${data.firstName} ${data.lastName}`,
            mobile: data.mobile,
            email: data.email,
            hourly_rate: data.hourlyRate,
            bank_details: data.bankDetails
        })
        .eq("id", userId);

    if (profileError) throw new Error("Failed to update profile: " + profileError.message);

    // 2. Update Org Role
    const { error: roleError } = await supabase
        .from("organization_members")
        .update({ role: data.role })
        .eq("organization_id", orgId)
        .eq("user_id", userId);

    if (roleError) throw new Error("Failed to update role: " + roleError.message);

    // 3. Update Team
    await supabase.from("team_members").delete().eq("user_id", userId);

    if (data.teamId && data.teamId !== "none") {
        await supabase.from("team_members").insert({
            team_id: data.teamId,
            user_id: userId
        });
    }

    // Log the change
    await logAction(
        orgId,
        "Updated User Profile",
        `${data.firstName} ${data.lastName}`,
        { email: data.email, role: data.role },
        {
            tableName: 'profiles',
            recordId: userId,
            previousData: previousProfile,
            newData: {
                full_name: `${data.firstName} ${data.lastName}`,
                mobile: data.mobile,
                email: data.email,
                hourly_rate: data.hourlyRate,
                bank_details: data.bankDetails
            }
        }
    );

    revalidatePath(`/dashboard/${orgId}/users`);
    return { success: true };
}

import { logAction } from "@/lib/actions/audit";

export async function bulkCreateUsers(orgId: string, users: any[]) {
    // Validate permission once
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error("Unauthorized");

    // Check permissions
    const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", orgId)
        .eq("user_id", currentUser.id)
        .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("Insufficient permissions to import users");
    }

    const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
    };

    // Process sequentially to avoid rate limits
    for (const u of users) {
        try {
            await createUser(orgId, {
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                mobile: u.mobile || "",
                role: u.role || "viewer",
                teamId: u.teamId // Optional
            });
            results.success++;
        } catch (e: any) {
            console.error(`Failed to import ${u.email}:`, e);
            results.failed++;
            results.errors.push(`${u.email}: ${e.message}`);
        }
    }

    revalidatePath(`/dashboard/${orgId}/users`);
    return results;
}

export async function removeUser(orgId: string, userId: string) {
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error("Unauthorized");

    // Check permissions (Only admins/owners/editors?) - Usually admins/owners
    const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", orgId)
        .eq("user_id", currentUser.id)
        .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("Insufficient permissions to remove users");
    }

    // Prevent removing self?
    if (currentUser.id === userId) {
        // Check if they are the only owner?
        // For now, allow leaving, but UI might warn.
        // Actually, if I remove myself, I lose access. Safe enough.
    }

    // Delete from organziation_members
    const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("organization_id", orgId)
        .eq("user_id", userId);

    if (error) {
        throw new Error("Failed to remove user: " + error.message);
    }

    revalidatePath(`/dashboard/${orgId}/users`);
}
