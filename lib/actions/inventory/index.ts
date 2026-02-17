'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type InventoryItem = {
    id: string;
    organization_id: string;
    sku: string;
    name: string;
    description: string | null;
    quantity: number;
    barcode: string | null;
    location: string | null;
    created_at: string;
    updated_at: string;
}

export async function getInventory(orgId: string) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: items, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("organization_id", orgId)
        .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    return items as InventoryItem[];
}

export async function createInventoryItem(orgId: string, data: { sku: string; name: string; description?: string; quantity: number; barcode?: string; location?: string }) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: item, error } = await supabase
        .from("inventory")
        .insert({
            organization_id: orgId,
            sku: data.sku,
            name: data.name,
            description: data.description,
            quantity: data.quantity,
            barcode: data.barcode,
            location: data.location
        })
        .select()
        .single();

    if (error) throw new Error("Failed to create item: " + error.message);

    revalidatePath(`/dashboard/${orgId}/inventory`);
    return item;
}

export async function updateInventoryItem(orgId: string, itemId: string, data: Partial<Omit<InventoryItem, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>) {
    const supabase = createClient();

    const { error } = await supabase
        .from("inventory")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", itemId)
        .eq("organization_id", orgId);

    if (error) throw new Error("Failed to update item: " + error.message);

    revalidatePath(`/dashboard/${orgId}/inventory`);
}

export async function deleteInventoryItem(orgId: string, itemId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", itemId)
        .eq("organization_id", orgId);

    if (error) throw new Error("Failed to delete item: " + error.message);

    revalidatePath(`/dashboard/${orgId}/inventory`);
}
