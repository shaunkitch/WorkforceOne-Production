"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getLastTimeEntry(orgId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data } = await supabase
        .from("time_entries")
        .select("*")
        .eq("organization_id", orgId)
        .eq("user_id", user.id)
        .order("clock_in", { ascending: false })
        .limit(1)
        .single();

    return data;
}

export async function clockIn(orgId: string, notes?: string, location?: any) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check if already clocked in
    const lastEntry = await getLastTimeEntry(orgId);
    if (lastEntry && !lastEntry.clock_out) {
        throw new Error("You are already clocked in.");
    }

    const { error } = await supabase.from("time_entries").insert({
        organization_id: orgId,
        user_id: user.id,
        clock_in: new Date().toISOString(),
        notes: notes,
        location: location
    });

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/${orgId}`);
    return { success: true };
}

export async function clockOut(orgId: string, notes?: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const lastEntry = await getLastTimeEntry(orgId);
    if (!lastEntry || lastEntry.clock_out) {
        throw new Error("You are not clocked in.");
    }

    const now = new Date();
    const start = new Date(lastEntry.clock_in);
    const durationMinutes = Math.round((now.getTime() - start.getTime()) / 60000);

    const { error } = await supabase
        .from("time_entries")
        .update({
            clock_out: now.toISOString(),
            duration_minutes: durationMinutes,
            notes: notes ? (lastEntry.notes ? lastEntry.notes + "\n" + notes : notes) : lastEntry.notes
        })
        .eq("id", lastEntry.id);

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/${orgId}`);
    return { success: true };
}

export async function getTimeEntries(orgId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data } = await supabase
        .from("time_entries")
        .select("*")
        .eq("organization_id", orgId)
        .eq("user_id", user.id)
        .order("clock_in", { ascending: false });

    return data || [];
}
