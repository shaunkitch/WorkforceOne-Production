import { SiteDialog } from "@/components/sites/site-dialog";
import { getSites } from "@/lib/actions/sites";
import { MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSite } from "@/lib/actions/sites";
import { revalidatePath } from "next/cache";

export default async function SitesPage({ params }: { params: { orgId: string } }) {
    const sites = await getSites(params.orgId);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Sites & Locations</h2>
                <div className="flex items-center space-x-2">
                    <SiteDialog orgId={params.orgId} />
                </div>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Address</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Radius</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Coordinates</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {sites.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="h-24 text-center">
                                        No sites found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                sites.map((site) => (
                                    <tr key={site.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">
                                            <div className="flex items-center">
                                                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {site.name}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">{site.address || "-"}</td>
                                        <td className="p-4 align-middle">{site.radius}m</td>
                                        <td className="p-4 align-middle">
                                            {site.latitude && site.longitude ? (
                                                <span className="text-xs font-mono">
                                                    {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                                                </span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <SiteDialog orgId={params.orgId} site={site} />
                                                <form action={async () => {
                                                    "use server"
                                                    await deleteSite(params.orgId, site.id)
                                                }}>
                                                    <Button variant="ghost" size="icon" type="submit">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </form>
                                            </div>
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
