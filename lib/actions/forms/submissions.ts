"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFormSubmissions(formId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: submissions } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("form_id", formId)
        .order("created_at", { ascending: false });

    return submissions || [];
}
