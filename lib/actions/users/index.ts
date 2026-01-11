"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getOrganizationMembers(orgId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Join with profiles if possible, or just fetch
    // Since Supabase join syntax is tricky with custom types sometimes, 
    // we might need to fetch members then fetch profiles, or use a view.
    // Assuming 'profiles' table exists and is linked.

    // Simplest approach: Fetch org members, then fetch their profile data
    const { data: members, error } = await supabase
        .from("organization_members")
        .select("*, profiles(*)") // This assumes foreign key exists from organization_members.user_id to profiles.id
        .eq("organization_id", orgId);

    // If FK doesn't exist explicitly for Supabase to auto-detect, we might fail here.
    // For this mock/dev environment, let's assume standard lookup.

    if (error) {
        // If join fails, just return members and we handle missing profile logic in UI
        console.error("Error fetching members:", error);
        const { data: rawMembers } = await supabase
            .from("organization_members")
            .select("*")
            .eq("organization_id", orgId);
        return rawMembers || [];
    }

    return members || [];
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
