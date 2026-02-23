import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useOrg } from '@/contexts/OrgContext';
import { Quote } from './quotes'; // Invoices are just quotes with a specific status

export function useInvoices() {
    const { org } = useOrg();
    const queryClient = useQueryClient();

    const getInvoicesQuery = useQuery({
        queryKey: ['invoices', org?.id],
        enabled: !!org?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('quotes')
                .select(`
          *,
          clients (name, email)
        `)
                .eq('organization_id', org!.id)
                .in('status', ['invoiced', 'paid']) // Only show true invoices
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return data as Quote[];
        }
    });

    const getInvoiceQuery = (invoiceId: string) => useQuery({
        queryKey: ['invoice', invoiceId],
        enabled: !!invoiceId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('quotes')
                .select(`
          *,
          clients (name, email, address, phone),
          items:quote_items(*)
        `)
                .eq('id', invoiceId)
                .single();

            if (error) throw new Error(error.message);
            return data as Quote;
        }
    });

    const updateInvoiceStatusMutation = useMutation({
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
            queryClient.invalidateQueries({ queryKey: ['invoices', org?.id] });
            queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['quotes', org?.id] }); // Also invalidates quotes list in case a quote status was reverted
        }
    });

    return {
        invoices: getInvoicesQuery.data || [],
        isLoadingInvoices: getInvoicesQuery.isLoading,
        getInvoice: getInvoiceQuery,
        updateInvoiceStatus: updateInvoiceStatusMutation,
    };
}
