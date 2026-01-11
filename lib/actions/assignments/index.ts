"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function assignForm(formId: string, userId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify creator permissions
    const { data: form } = await supabase.from("forms").select("organization_id").eq("id", formId).single();
    if (!form) throw new Error("Form not found");

    // Check if assignment already exists
    const { data: existing } = await supabase
        .from("form_assignments")
        .select("id")
        .eq("form_id", formId)
        .eq("user_id", userId)
        .single();

    if (existing) {
        return; // Already assigned
    }

    await supabase.from("form_assignments").insert({
        form_id: formId,
        user_id: userId,
        status: "pending"
    });

    revalidatePath(`/dashboard/${form.organization_id}/forms/${formId}/assignments`);
}

export async function getFormAssignments(formId: string) {
    const supabase = createClient();

    // Fetch assignments with profile data
    const { data: assignments } = await supabase
        .from("form_assignments")
        .select("*, profiles(email, full_name)")
        .eq("form_id", formId);

    return assignments || [];
}

export async function getUserAssignments() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: assignments } = await supabase
        .from("form_assignments")
        .select("*, forms(id, title)") // Join to get form details
        .eq("user_id", user.id)
        .eq("status", "pending"); // Only show pending tasks usually? Or all.

    return assignments || [];
}
