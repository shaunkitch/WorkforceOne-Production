"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitLeaveRequest(orgId: string, data: {
    startDate: Date;
    endDate: Date;
    leaveType: string;
    reason?: string;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("leave_requests").insert({
        organization_id: orgId,
        user_id: user.id,
        start_date: data.startDate.toISOString(),
        end_date: data.endDate.toISOString(),
        leave_type: data.leaveType,
        reason: data.reason
    });

    if (error) throw new Error(error.message);

    revalidatePath(`/dashboard/${orgId}/hr/leave`);
    return { success: true };
}

export async function getLeaveRequests(orgId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch user's own requests
    const { data } = await supabase
        .from("leave_requests")
        .select("*")
        .eq("organization_id", orgId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return data || [];
}

export async function updateLeaveStatus(orgId: string, requestId: string, status: 'approved' | 'rejected', note?: string) {
    const supabase = createClient();

    // Auth check is handled by RLS policy "Admins/Owners can update leave requests"
    // But we check session just in case
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("leave_requests")
        .update({ status: status, manager_note: note })
        .eq("id", requestId)
        .eq("organization_id", orgId);

    if (error) throw new Error(error.message);

    revalidatePath(`/dashboard/${orgId}/hr/leave`);
    return { success: true };
}
