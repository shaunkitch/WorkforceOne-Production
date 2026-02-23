import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useOrg } from '@/contexts/OrgContext';

export type QuoteItem = {
    id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
};

export type Quote = {
    id: string;
    organization_id: string;
    client_id: string;
    number: number;
    title: string;
    status: 'draft' | 'sent' | 'approved' | 'invoiced' | 'paid';
    total_amount: number;
    created_at: string;
    clients?: { name: string; email: string };
    items?: QuoteItem[];
};

export function useQuotes() {
    const { org } = useOrg();
    const queryClient = useQueryClient();

    const getQuotesQuery = useQuery({
        queryKey: ['quotes', org?.id],
        enabled: !!org?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('quotes')
                .select(`
          *,
          clients (name, email)
        `)
                .eq('organization_id', org!.id)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return data as Quote[];
        }
    });

    const getQuoteQuery = (quoteId: string) => useQuery({
        queryKey: ['quote', quoteId],
        enabled: !!quoteId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('quotes')
                .select(`
          *,
          clients (name, email, address, phone),
          items:quote_items(*)
        `)
                .eq('id', quoteId)
                .single();

            if (error) throw new Error(error.message);
            return data as Quote;
        }
    });

    const createQuoteMutation = useMutation({
        mutationFn: async (quoteData: { clientId: string; title: string; items: QuoteItem[] }) => {
            if (!org?.id) throw new Error('No organization selected');

            // 1. Calculate total
            const totalAmount = quoteData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

            // 2. Create Header
            const { data: headerData, error: headerError } = await supabase
                .from('quotes')
                .insert({
                    organization_id: org.id,
                    client_id: quoteData.clientId,
                    title: quoteData.title,
                    status: 'draft',
                    total_amount: totalAmount,
                })
                .select()
                .single();

            if (headerError) throw new Error('Failed to create quote header: ' + headerError.message);

            // 3. Create Items
            if (quoteData.items.length > 0) {
                const itemsToInsert = quoteData.items.map(item => ({
                    quote_id: headerData.id,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                }));

                const { error: itemsError } = await supabase
                    .from('quote_items')
                    .insert(itemsToInsert);

                if (itemsError) throw new Error('Failed to add items: ' + itemsError.message);
            }

            return headerData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes', org?.id] });
        }
    });

    const updateQuoteStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: Quote['status'] }) => {
            const { data, error } = await supabase
                .from('quotes')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['quotes', org?.id] });
            queryClient.invalidateQueries({ queryKey: ['quote', variables.id] });
            // If it became an invoice, invalidate invoices list as well
            if (variables.status === 'invoiced' || variables.status === 'paid') {
                queryClient.invalidateQueries({ queryKey: ['invoices', org?.id] });
            }
        }
    });

    const updateQuoteMutation = useMutation({
        mutationFn: async (quoteData: { id: string; clientId: string; title: string; items: QuoteItem[] }) => {
            if (!org?.id) throw new Error('No organization selected');

            const totalAmount = quoteData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

            // 1. Update Header
            const { error: headerError } = await supabase
                .from('quotes')
                .update({
                    client_id: quoteData.clientId,
                    title: quoteData.title,
                    total_amount: totalAmount,
                })
                .eq('id', quoteData.id)
                .eq('organization_id', org.id);

            if (headerError) throw new Error('Failed to update quote header: ' + headerError.message);

            // 2. Delete existing items
            const { error: deleteError } = await supabase
                .from('quote_items')
                .delete()
                .eq('quote_id', quoteData.id);

            if (deleteError) throw new Error('Failed to clean old line items: ' + deleteError.message);

            // 3. Insert fresh items
            if (quoteData.items.length > 0) {
                const itemsToInsert = quoteData.items.map(item => ({
                    quote_id: quoteData.id,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                }));

                const { error: itemsError } = await supabase
                    .from('quote_items')
                    .insert(itemsToInsert);

                if (itemsError) throw new Error('Failed to update items: ' + itemsError.message);
            }

            return { id: quoteData.id };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['quotes', org?.id] });
            queryClient.invalidateQueries({ queryKey: ['quote', data.id] });
        }
    });

    return {
        quotes: getQuotesQuery.data || [],
        isLoadingQuotes: getQuotesQuery.isLoading,
        getQuote: getQuoteQuery,
        createQuote: createQuoteMutation,
        updateQuote: updateQuoteMutation,
        updateQuoteStatus: updateQuoteStatusMutation,
    };
}
