"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFormSubmissions(formId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    console.log("Fetching submissions for form:", formId);
    console.log("User:", user.id);

    const { data: submissions, error } = await supabase
        .from("submissions")
        .select(`
            *,
            profiles (full_name),
            clients (name),
            visits (title)
        `)
        .eq("form_id", formId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching submissions:", error);
    }
    console.log("Submissions found:", submissions?.length);

    return submissions || [];
}
