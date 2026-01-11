"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPayrollRun(orgId: string, start: Date, end: Date, title: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Create Payroll Run Draft
    const { data: run, error: runError } = await supabase
        .from("payroll_runs")
        .insert({
            organization_id: orgId,
            period_start: start.toISOString(),
            period_end: end.toISOString(),
            title: title,
            created_by: user.id,
            status: "draft"
        })
        .select()
        .single();

    if (runError) throw new Error(runError.message);

    // 2. Fetch all members with their hourly rates
    const { data: members } = await supabase
        .from("organization_members")
        .select("user_id, profiles(id, hourly_rate)")
        .eq("organization_id", orgId);

    if (!members) return { success: true, runId: run.id };

    let totalPayrollAmount = 0;
    const items = [];

    // 3. Calculate Pay for each member
    for (const member of members) {
        const profile = (member.profiles as any);
        if (!profile) continue;

        const hourlyRate = profile.hourly_rate || 0;

        // Fetch time entries in range
        const { data: entries } = await supabase
            .from("time_entries")
            .select("duration_minutes")
            .eq("user_id", member.user_id)
            .eq("organization_id", orgId)
            .gte("clock_in", start.toISOString())
            .lte("clock_out", end.toISOString());

        const totalMinutes = entries?.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) || 0;
        const totalHours = Number((totalMinutes / 60).toFixed(2));
        const grossPay = Number((totalHours * hourlyRate).toFixed(2));
        const netPay = grossPay; // Deductions/Bonuses handled later

        if (totalHours > 0 || hourlyRate > 0) {
            items.push({
                payroll_run_id: run.id,
                user_id: member.user_id,
                total_hours: totalHours,
                hourly_rate: hourlyRate,
                gross_pay: grossPay,
                net_pay: netPay
            });
            totalPayrollAmount += netPay;
        }
    }

    // 4. Insert Items
    if (items.length > 0) {
        const { error: itemsError } = await supabase.from("payroll_items").insert(items);
        if (itemsError) throw new Error("Failed to create items: " + itemsError.message);
    }

    // 5. Update Run Totals
    await supabase.from("payroll_runs").update({
        total_amount: totalPayrollAmount
    }).eq("id", run.id);

    revalidatePath(`/dashboard/${orgId}/hr/payroll`);
    return { success: true, runId: run.id };
}

export async function getPayrollRuns(orgId: string) {
    const supabase = createClient();
    const { data } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });
    return data || [];
}

export async function getPayrollRunDetails(runId: string) {
    const supabase = createClient();
    const { data: run } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("id", runId)
        .single();

    if (!run) return null;

    const { data: items } = await supabase
        .from("payroll_items")
        .select("*, profiles(full_name, email)")
        .eq("payroll_run_id", runId);

    return { run, items: items || [] };
}
