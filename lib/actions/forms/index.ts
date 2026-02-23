'use server'

import { createClient } from "@/lib/supabase/server";
import { Database, Json } from "@/types/database";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types/actions";

export async function createForm(orgId: string, title: string, content?: Json): Promise<ActionResponse<any>> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        // Verify permissions (assuming owner/admin/editor can create)
        const { data: membership } = await supabase
            .from("organization_members")
            .select("role")
            .eq("organization_id", orgId)
            .eq("user_id", user.id)
            .single();

        if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
            return { success: false, error: "Insufficient permissions to create forms" };
        }

        const { data, error } = await supabase
            .from("forms")
            .insert({
                organization_id: orgId,
                title: title,
                content: content || [], // Use template content if provided
                is_published: false
            })
            .select()
            .single();

        if (error) return { success: false, error: error.message };

        revalidatePath(`/dashboard/${orgId}/forms`);
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getForms(orgId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // RLS will handle filtering, but we pass orgId for index usage usually, 
    // though here we just query by orgId.
    // We should ideally verify membership first to avoid unnecessary queries if not member,
    // but RLS is the safety net.

    const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data;
}

export async function getForm(formId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

    if (error) throw new Error(error.message);

    return data;
}

export async function updateForm(formId: string, updates: { title?: string; content?: Json; is_published?: boolean }): Promise<ActionResponse<any>> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        // Fetch form to get orgId (to check permissions)
        const { data: form } = await supabase
            .from("forms")
            .select("organization_id")
            .eq("id", formId)
            .single();

        if (!form) return { success: false, error: "Form not found" };

        const { data: membership } = await supabase
            .from("organization_members")
            .select("role")
            .eq("organization_id", form.organization_id)
            .eq("user_id", user.id)
            .single();

        if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
            return { success: false, error: "Insufficient permissions to update form" };
        }

        const { data, error } = await supabase
            .from("forms")
            .update(updates)
            .eq("id", formId)
            .select()
            .single();

        if (error) return { success: false, error: error.message };

        revalidatePath(`/dashboard/${form.organization_id}/builder/${formId}`);
        revalidatePath(`/dashboard/${form.organization_id}/forms`);

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function publishForm(formId: string): Promise<ActionResponse<any>> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const { data: form } = await supabase
            .from("forms")
            .select("organization_id")
            .eq("id", formId)
            .single();

        if (!form) return { success: false, error: "Form not found" };

        const { data: membership } = await supabase
            .from("organization_members")
            .select("role")
            .eq("organization_id", form.organization_id)
            .eq("user_id", user.id)
            .single();

        if (!membership || !["owner", "admin"].includes(membership.role)) {
            return { success: false, error: "Insufficient permissions to publish form" };
        }

        const { data, error } = await supabase
            .from("forms")
            .update({ is_published: true })
            .eq("id", formId)
            .select()
            .single();

        if (error) return { success: false, error: error.message };

        revalidatePath(`/dashboard/${form.organization_id}/builder/${formId}`);

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function submitForm(formUrl: string, content: string): Promise<ActionResponse<any>> {
    try {
        const supabase = createClient();
        const { data: form } = await supabase.from("forms").select("id, is_published").eq("id", formUrl).single();

        if (!form || !form.is_published) {
            return { success: false, error: "Form not found or not published" };
        }

        const parsedContent = JSON.parse(content);

        // Extract system fields from frontend FormBuilder payload (if provided as hidden inputs)
        const assignmentId = parsedContent.assignment_id || parsedContent.assignmentId || null;
        const taskId = parsedContent.task_id || parsedContent.taskId || null;
        const visitId = parsedContent.visit_id || parsedContent.visitId || null;

        const { data: submission, error } = await supabase.from("submissions").insert({
            form_id: form.id,
            assignment_id: assignmentId,
            visit_id: visitId,
            data: parsedContent,
        }).select().single();

        if (error) return { success: false, error: error.message };

        // Handle Lifecycle Updates locally to replace the old database trigger
        if (taskId) {
            await supabase.from("tasks").update({ status: "DONE" }).eq("id", taskId);
        } else if (assignmentId) {
            await supabase.from("form_assignments").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", assignmentId);
        }

        if (visitId) {
            await supabase.from("visits").update({ status: "completed" }).eq("id", visitId);
        }

        // Trigger Automations (Fire and Forget)
        try {
            const { getAutomations, executeAutomations } = await import("@/lib/actions/automations");
            const autos = await getAutomations(form.id);
            if (autos.length > 0) {
                await executeAutomations(autos, submission);
            }
        } catch (error) {
            console.error("Automation Trigger Failed:", error);
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteForm(formId: string): Promise<ActionResponse<void>> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const { data: form } = await supabase
            .from("forms")
            .select("organization_id")
            .eq("id", formId)
            .single();

        if (!form) return { success: false, error: "Form not found" };

        const { data: membership } = await supabase
            .from("organization_members")
            .select("role")
            .eq("organization_id", form.organization_id)
            .eq("user_id", user.id)
            .single();

        if (!membership || !["owner", "admin"].includes(membership.role)) {
            return { success: false, error: "Insufficient permissions to delete form" };
        }

        const { error } = await supabase
            .from("forms")
            .delete()
            .eq("id", formId);

        if (error) return { success: false, error: error.message };

        revalidatePath(`/dashboard/${form.organization_id}/forms`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
