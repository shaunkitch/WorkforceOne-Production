"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
});

export async function createForm(prevState: any, formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
    };

    const validatedFields = createFormSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { title, description } = validatedFields.data;
    const orgId = formData.get("orgId") as string;

    if (!orgId) {
        return { error: "Organization ID is missing" };
    }

    const { data: form, error } = await supabase
        .from("forms")
        .insert({
            organization_id: orgId,
            title,
            // We can store description in 'content' or add a column. 
            // Schema says 'content jsonb', so maybe description goes there or we rely on title only for now.
            // Let's assume standard 'content' is for the form schema.
            // Schema.sql doesn't have 'description' column on forms table.
            // I will ignore description for now or put it in content metadata if needed.
            content: { description },
            is_published: false,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating form:", error);
        return { error: "Failed to create form" };
    }

    revalidatePath(`/dashboard/${orgId}/forms`);
    redirect(`/dashboard/${orgId}/forms/${form.id}/edit`);
}
