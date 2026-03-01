import { VisitDialog } from "@/components/visits/visit-dialog";
import { getVisits, deleteVisit, updateVisitStatus } from "@/lib/actions/visits";
import { Trash2, Calendar, MapPin, CheckCircle, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function VisitsPage({ params }: { params: { orgId: string } }) {
    const visits = await getVisits(params.orgId);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Group visits by client
    const grouped = visits.reduce((acc, visit) => {
        const key = visit.client_id ?? '__none__';
        if (!acc[key]) acc[key] = { client: visit.clients, visits: [] };
        acc[key].visits.push(visit);
        return acc;
    }, {} as Record<string, { client: (typeof visits)[0]['clients']; visits: typeof visits }>);

    // Sort groups: named clients first (alphabetically), then unassigned
    const sortedGroups = Object.entries(grouped).sort(([, a], [, b]) => {
        if (!a.client && b.client) return 1;
        if (a.client && !b.client) return -1;
        return (a.client?.name ?? '').localeCompare(b.client?.name ?? '');
    });

    return (
        <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Visits &amp; Appointments</h2>
                <VisitDialog orgId={params.orgId} />
            </div>

            <div className="space-y-6">
                {visits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No visits scheduled</p>
                        <p className="text-sm text-muted-foreground">Schedule your first client visit using the button above.</p>
                    </div>
                ) : (
                    sortedGroups.map(([key, group]) => (
                        <div key={key} className="rounded-lg border bg-card">
                            {/* Client header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30 rounded-t-lg">
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="font-semibold text-sm">{group.client?.name ?? 'No Client'}</span>
                                {group.client?.address && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {group.client.address}
                                    </span>
                                )}
                                <Badge variant="secondary" className="ml-auto text-xs">
                                    {group.visits.length} {group.visits.length === 1 ? 'visit' : 'visits'}
                                </Badge>
                            </div>

                            {/* Visit rows */}
                            <div className="divide-y">
                                {group.visits.map((visit) => (
                                    <div key={visit.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
                                        {/* Title + description */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{visit.title}</p>
                                            {visit.description && (
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">{visit.description}</p>
                                            )}
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(visit.scheduled_at)}
                                        </div>

                                        {/* Assignee */}
                                        {visit.profiles && (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                                                <Users className="h-3.5 w-3.5" />
                                                {visit.profiles.full_name}
                                            </div>
                                        )}

                                        {/* Status badge */}
                                        <span className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide
                                            ${visit.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                visit.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                            {visit.status}
                                        </span>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <VisitDialog orgId={params.orgId} visit={visit} />

                                            {visit.status === 'scheduled' && (
                                                <form action={async () => {
                                                    "use server"
                                                    await updateVisitStatus(params.orgId, visit.id, 'completed')
                                                }}>
                                                    <Button variant="ghost" size="icon" type="submit" title="Mark complete" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            )}

                                            <form action={async () => {
                                                "use server"
                                                await deleteVisit(params.orgId, visit.id)
                                            }}>
                                                <Button variant="ghost" size="icon" type="submit" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
