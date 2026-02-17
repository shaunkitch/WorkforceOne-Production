import { ItemDialog } from "@/components/inventory/item-dialog";
import { getInventory, deleteInventoryItem } from "@/lib/actions/inventory";
import { Trash2, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function InventoryPage({ params }: { params: { orgId: string } }) {
    const items = await getInventory(params.orgId);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
                <div className="flex items-center space-x-2">
                    <ItemDialog orgId={params.orgId} />
                </div>
            </div>

            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter inventory..."
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">SKU</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Quantity</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Barcode</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="h-24 text-center">
                                        No items found. Add items to track stock.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-mono text-xs">{item.sku}</td>
                                        <td className="p-4 align-middle font-medium">
                                            <div className="flex items-center">
                                                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {item.name}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={item.quantity === 0 ? "text-destructive font-bold" : ""}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">{item.location || "-"}</td>
                                        <td className="p-4 align-middle font-mono text-xs">{item.barcode || "-"}</td>
                                        <td className="p-4 align-middle text-right">
                                            <form action={async () => {
                                                "use server"
                                                await deleteInventoryItem(params.orgId, item.id)
                                            }}>
                                                <Button variant="ghost" size="icon" type="submit">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
