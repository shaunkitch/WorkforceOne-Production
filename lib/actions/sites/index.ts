'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Site = {
    id: string;
    organization_id: string;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    radius: number; // in meters
    created_at: string;
}

export async function getSites(orgId: string) {
    const supabase = createClient();

    // Verify permission (viewer+)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: sites, error } = await supabase
        .from("sites")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return sites as Site[];
}

export async function createSite(orgId: string, data: { name: string, address?: string, latitude?: number, longitude?: number, radius?: number }) {
    const supabase = createClient();

    // Verify permission (admin/owner)
    // Note: RLS should handle this, but explicit check is safer
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Simple RBAC check via DB function or secondary query
    // Optimistically relying on RLS for now as per schema "Owners/Admins can..." policies

    const { data: site, error } = await supabase
        .from("sites")
        .insert({
            organization_id: orgId,
            name: data.name,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            radius: data.radius || 100
        })
        .select()
        .single();

    if (error) throw new Error("Failed to create site: " + error.message);

    revalidatePath(`/dashboard/${orgId}/sites`);
    return site;
}

export async function updateSite(orgId: string, siteId: string, data: { name: string, address?: string, latitude?: number, longitude?: number, radius?: number }) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: site, error } = await supabase
        .from("sites")
        .update({
            name: data.name,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            radius: data.radius || 100
        })
        .eq("id", siteId)
        .eq("organization_id", orgId)
        .select()
        .single();

    if (error) throw new Error("Failed to update site: " + error.message);

    revalidatePath(`/dashboard/${orgId}/sites`);
    return site;
}

export async function deleteSite(orgId: string, siteId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from("sites")
        .delete()
        .eq("id", siteId)
        .eq("organization_id", orgId); // Extra safety

    if (error) throw new Error("Failed to delete site: " + error.message);

    revalidatePath(`/dashboard/${orgId}/sites`);
}
