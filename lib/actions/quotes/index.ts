'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Quote = {
    id: string;
    organization_id: string;
    client_id: string;
    number: number;
    title: string;
    status: string;
    total_amount: number;
    valid_until: string | null;
    created_at: string;
    clients?: { name: string; email: string };
    items?: QuoteItem[];
}

export type QuoteItem = {
    id: string;
    quote_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export async function getQuotes(orgId: string) {
    const supabase = createClient();

    let user = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (error) {
        console.error("[getQuotes] Auth/Network Error:", error);
        return [];
    }

    if (!user) {
        console.warn("[getQuotes] No user found via getUser");
        throw new Error("Unauthorized");
    }

    const { data: quotes, error } = await supabase
        .from("quotes")
        .select(`
            *,
            clients (name, email)
        `)
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return quotes as Quote[];
}

export async function getQuote(orgId: string, quoteId: string) {
    const supabase = createClient();

    const { data: quote, error } = await supabase
        .from("quotes")
        .select(`
            *,
            clients (name, email, address, phone),
            items:quote_items(*)
        `)
        .eq("id", quoteId)
        .eq("organization_id", orgId)
        .single();

    if (error) throw new Error(error.message);

    return quote as Quote;
}

export async function createQuote(orgId: string, data: { clientId: string; title: string; items: any[] }) {
    const supabase = createClient();

    // 1. Create Quote Header
    const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
            organization_id: orgId,
            client_id: data.clientId,
            title: data.title,
            status: 'draft',
            total_amount: data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        })
        .select()
        .single();

    if (quoteError) throw new Error("Failed to create quote: " + quoteError.message);

    // 2. Create Quote Items
    if (data.items.length > 0) {
        const itemsToInsert = data.items.map(item => ({
            quote_id: quote.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice
        }));

        const { error: itemsError } = await supabase
            .from("quote_items")
            .insert(itemsToInsert);

        if (itemsError) throw new Error("Failed to add items: " + itemsError.message);
    }

    revalidatePath(`/dashboard/${orgId}/quotes`);
    return quote;
}

export async function updateQuoteStatus(orgId: string, quoteId: string, status: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from("quotes")
        .update({ status })
        .eq("id", quoteId)
        .eq("organization_id", orgId);

    if (error) throw new Error("Failed to update quote: " + error.message);

    revalidatePath(`/dashboard/${orgId}/quotes`);
}

export async function deleteQuote(orgId: string, quoteId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", quoteId)
        .eq("organization_id", orgId);

    if (error) throw new Error("Failed to delete quote: " + error.message);

    revalidatePath(`/dashboard/${orgId}/quotes`);
}
