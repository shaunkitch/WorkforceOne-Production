import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useOrg } from '@/contexts/OrgContext';

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
};

export function useInventory() {
    const { org } = useOrg();
    const queryClient = useQueryClient();

    const getInventoryQuery = useQuery({
        queryKey: ['inventory', org?.id],
        enabled: !!org?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('organization_id', org!.id)
                .order('name', { ascending: true });

            if (error) throw new Error(error.message);
            return data as InventoryItem[];
        }
    });

    const useGetInventoryItemQuery = (itemId: string) => useQuery({
        queryKey: ['inventoryItem', itemId],
        enabled: !!itemId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('id', itemId)
                .single();

            if (error) throw new Error(error.message);
            return data as InventoryItem;
        }
    });

    const createInventoryMutation = useMutation({
        mutationFn: async (itemData: { sku: string; name: string; description?: string; quantity: number; barcode?: string; location?: string }) => {
            if (!org?.id) throw new Error('No organization selected');

            const { data, error } = await supabase
                .from('inventory')
                .insert({
                    organization_id: org.id,
                    ...itemData
                })
                .select()
                .single();

            if (error) throw new Error('Failed to create inventory item: ' + error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', org?.id] });
        }
    });

    const updateInventoryMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<InventoryItem, 'id' | 'organization_id' | 'created_at' | 'updated_at'>> }) => {
            const { data: updatedData, error } = await supabase
                .from('inventory')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return updatedData;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['inventory', org?.id] });
            queryClient.invalidateQueries({ queryKey: ['inventoryItem', variables.id] });
        }
    });

    const deleteInventoryMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('inventory')
                .delete()
                .eq('id', id);

            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', org?.id] });
        }
    });

    return {
        inventory: getInventoryQuery.data || [],
        isLoadingInventory: getInventoryQuery.isLoading,
        getInventoryItem: useGetInventoryItemQuery,
        createInventoryItem: createInventoryMutation,
        updateInventoryItem: updateInventoryMutation,
        deleteInventoryItem: deleteInventoryMutation,
    };
}
