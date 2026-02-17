"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFormStats(formId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // We can assume RLS protects the counts, but explicit check is good practice
    // For now, let's just count
    const { count, error } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("form_id", formId);

    const submissions = count || 0;

    // If we had a view or visits table we could calculate rate
    const visits = 0; // Placeholder
    const rate = 0; // Placeholder

    return {
        visits,
        submissions: submissions || 0,
        rate,
    };
}
