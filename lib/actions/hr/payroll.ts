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

    // Fetch all sites for geofencing compliance check
    const { data: sites } = await supabase
        .from("sites")
        .select("latitude, longitude, radius")
        .eq("organization_id", orgId);

    function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371e3; // metres
        const p1 = lat1 * Math.PI / 180;
        const p2 = lat2 * Math.PI / 180;
        const dp = (lat2 - lat1) * Math.PI / 180;
        const dl = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

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
            .select("duration_minutes, location")
            .eq("user_id", member.user_id)
            .eq("organization_id", orgId)
            .gte("clock_in", start.toISOString())
            .lte("clock_out", end.toISOString());

        // Check Geofence Compliance
        let verifiedShifts = 0;
        entries?.forEach(entry => {
            if (entry.location) {
                // Support multiple JSON location structures across web/mobile
                const locData = entry.location as any;
                const lat = locData.latitude || locData.coords?.latitude || locData.lat;
                const lng = locData.longitude || locData.coords?.longitude || locData.lng;

                if (lat && lng && sites) {
                    const isVerified = sites.some(site => {
                        if (!site.latitude || !site.longitude) return false;
                        return getDistance(lat, lng, site.latitude, site.longitude) <= (site.radius || 100);
                    });
                    if (isVerified) verifiedShifts++;
                }
            }
        });

        const totalMinutes = entries?.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) || 0;
        const totalHours = Number((totalMinutes / 60).toFixed(2));
        const grossPay = Number((totalHours * hourlyRate).toFixed(2));

        // $5 Compliance Bonus per Verified Shift
        const verifiedBonus = verifiedShifts * 5;
        const netPay = grossPay + verifiedBonus;

        if (totalHours > 0 || hourlyRate > 0) {
            items.push({
                payroll_run_id: run.id,
                user_id: member.user_id,
                total_hours: totalHours,
                hourly_rate: hourlyRate,
                gross_pay: grossPay,
                bonuses: verifiedBonus,
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

    const { data: items, error } = await supabase
        .from("payroll_items")
        .select("*, profiles(full_name, email)")
        .eq("payroll_run_id", runId);

    if (error) {
        console.error("Error fetching payroll items:", error);
    } else {
        console.log(`Fetched ${items?.length} items for run ${runId}`);
    }

    return { run, items: items || [] };
}
