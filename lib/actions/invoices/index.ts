'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Invoice = {
    id: string;
    organization_id: string;
    client_id: string;
    number: number;
    title: string;
    status: string;
    total_amount: number;
    valid_until: string | null;
    currency: string | null;
    created_at: string;
    updated_at: string;
    clients?: { name: string; email: string | null; address: string | null; phone: string | null };
    items?: InvoiceItem[];
}

export type InvoiceItem = {
    id: string;
    quote_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

/** Fetch all invoices (quotes with status = 'invoiced') for an org */
export async function getInvoices(orgId: string): Promise<Invoice[]> {
    const supabase = createClient();

    let user = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (error) {
        console.error("[getInvoices] Auth/Network Error:", error);
        return [];
    }

    if (!user) throw new Error("Unauthorized");

    const { data: invoices, error } = await supabase
        .from("quotes")
        .select(`
            *,
            clients (name, email)
        `)
        .eq("organization_id", orgId)
        .eq("status", "invoiced")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (invoices ?? []) as Invoice[];
}

/** Fetch a single invoice (quote with status = 'invoiced') by ID */
export async function getInvoice(orgId: string, invoiceId: string): Promise<Invoice> {
    const supabase = createClient();

    const { data: invoice, error } = await supabase
        .from("quotes")
        .select(`
            *,
            clients (name, email, address, phone),
            items:quote_items(*)
        `)
        .eq("id", invoiceId)
        .eq("organization_id", orgId)
        .single();

    if (error) throw new Error(error.message);

    return invoice as Invoice;
}

/** Revert an invoice back to a quote (set status to 'approved') */
export async function revertInvoiceToQuote(orgId: string, invoiceId: string) {
    const supabase = createClient();

    const { error } = await (supabase.from("quotes") as any)
        .update({ status: "approved" })
        .eq("id", invoiceId)
        .eq("organization_id", orgId);

    if (error) throw new Error("Failed to revert invoice: " + error.message);

    revalidatePath(`/dashboard/${orgId}/invoices`);
    revalidatePath(`/dashboard/${orgId}/quotes`);
}

/** Mark an invoice as paid */
export async function markInvoicePaid(orgId: string, invoiceId: string) {
    const supabase = createClient();

    const { error } = await (supabase.from("quotes") as any)
        .update({ status: "paid" })
        .eq("id", invoiceId)
        .eq("organization_id", orgId);

    if (error) throw new Error("Failed to mark invoice paid: " + error.message);

    revalidatePath(`/dashboard/${orgId}/invoices`);
}
