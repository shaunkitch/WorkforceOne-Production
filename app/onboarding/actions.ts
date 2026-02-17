'use server'

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const createOrganizationSchema = z.object({
    name: z.string().min(2, "Organization name must be at least 2 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").optional().or(z.literal("")),
});

export async function createOrganization(prevState: any, formData: FormData) {
    const supabase = createClient();

    let user = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (error) {
        console.error("createOrganization Auth Error:", error);
        return { error: "Authentication failed. Please try again." };
    }

    if (!user) {
        return {
            error: "You must be logged in to create an organization",
        };
    }

    const rawData = {
        name: formData.get("name"),
        slug: formData.get("slug"),
    };

    const validatedFields = createOrganizationSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, slug } = validatedFields.data;

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).substring(2, 7);

    // 1a. Ensure Profile Exists (Fix for FK Constraint Error)
    // The user might exist in auth.users but not in public.profiles yet.
    const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || "",
        avatar_url: user.user_metadata?.avatar_url || "",
    }, { onConflict: "id", ignoreDuplicates: true });

    if (profileError) {
        console.error("Error creating profile:", profileError);
        // We continue anyway; maybe it failed because it exists (though ignoreDuplicates should handle that)
        // or maybe RLS prevented it. But usually this is critical for the FK.
    }

    // 1. Create Organization
    console.log("Creating organization for user:", user.id);

    const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
            name,
            slug: finalSlug,
            created_by_user_id: user.id,
        })
        .select()
        .single();

    if (orgError) {
        console.error("Error creating organization:", orgError);
        // Explicitly check for RLS policy violation code if needed (42501 commonly)
        return {
            error: "Failed to create organization. " + (orgError.message || orgError.code),
        };
    }

    // 2. Add Member (Owner)
    // Note: The 'Allow initial owner to self-assign' policy handles the permission for this.
    const { error: memberError } = await supabase.from("organization_members").insert({
        organization_id: org.id,
        user_id: user.id,
        role: "owner",
    });

    if (memberError) {
        console.error("Error adding member:", memberError);
        // Cleanup organization if member creation fails? 
        // Ideally yes, but for now let's just report error. 
        // Without transaction this is tricky, but RLS should allow it.
        return {
            error: "Organization created but failed to assign owner. " + memberError.message,
        };
    }

    revalidatePath("/dashboard");
    redirect(`/dashboard/${org.id}`);
}
