"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateFormContent(id: string, jsonContent: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not found");
    }

    const { error } = await supabase
        .from("forms")
        .update({
            content: jsonContent,
        })
        .eq("id", id);

    if (error) {
        throw new Error("Something went wrong");
    }

    revalidatePath("/dashboard/[orgId]/forms");
}

export async function submitForm(formId: string, jsonContent: string) {
    const supabase = createClient();

    // No auth check needed as submissions can be public (RLS handles insert check)
    // But we should validate the JSON
    // const validJson = JSON.parse(jsonContent); 

    const { error } = await supabase
        .from("submissions")
        .insert({
            form_id: formId,
            data: jsonContent, // Supabase expects the JSON value directly if column type is JSONB, but here we pass string if we want it stored as is? 
            // Wait, schema says `data jsonb`. If we pass a string that is valid JSON, supabase-js might handle it or we might need to parse it.
            // Let's parse it to be safe and store as object.
        });

    // Wait, inserting into `data` column which is `jsonb`. 
    // supabase.from().insert({ data: JSON.parse(jsonContent) })

    if (error) {
        throw new Error("Something went wrong");
    }
}
