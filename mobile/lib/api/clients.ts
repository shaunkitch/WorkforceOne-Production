import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useOrg } from '@/contexts/OrgContext';

export type Client = {
    id: string;
    name: string;
    email: string | null;
};

export function useClients() {
    const { org } = useOrg();

    const getClientsQuery = useQuery({
        queryKey: ['clients', org?.id],
        enabled: !!org?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('id, name, email')
                .eq('organization_id', org!.id)
                .order('name', { ascending: true });

            if (error) throw new Error(error.message);
            return data as Client[];
        }
    });

    return {
        clients: getClientsQuery.data || [],
        isLoadingClients: getClientsQuery.isLoading,
    };
}
