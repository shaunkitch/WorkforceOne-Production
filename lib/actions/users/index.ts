"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { OrganizationMember } from "@/types/app";

export async function getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch members with profiles
    const { data: members, error } = await supabase
        .from("organization_members")
        .select(`
            *,
            profiles (*)
        `)
        .eq("organization_id", orgId);

    if (error) {
        console.error("Error fetching members:", error);
        return [];
    }

    return members as OrganizationMember[];
}

export async function inviteMember(orgId: string, email: string, role: "owner" | "admin" | "editor" | "viewer") {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check permissions
    const { data: currentMember } = await supabase.from("organization_members")
        .select("role")
        .eq("organization_id", orgId)
        .eq("user_id", user.id)
        .single();

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
        throw new Error("Insufficient permissions");
    }

    // 1. Check if user exists in profiles (by email lookup - might need a separate RPC or search if email is PII protected)
    // For this simple implementation, let's assume we can search profiles by email.
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("email", email).single();

    if (!existingProfile) {
        // In a real app, we'd create an "invitation" record and send an email.
        // since we can't create specific users easily without them signing up in Supabase Auth first mostly.
        // For this demo/MVP: We'll assume the user MUST exist in DB to be added (simulated).
        // Or we throw strict error: "User not found. Please ask them to sign up first."
        throw new Error("User with this email does not exist. Please ask them to sign up first.");
    }

    // 2. Add to organization_members
    await supabase.from("organization_members").insert({
        organization_id: orgId,
        user_id: existingProfile.id,
        role: role
    });

    revalidatePath(`/dashboard/${orgId}/settings/members`);
}
