import { VisitDialog } from "@/components/visits/visit-dialog";
import { getVisits, deleteVisit, updateVisitStatus } from "@/lib/actions/visits";
import { Trash2, Calendar, MapPin, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function VisitsPage({ params }: { params: { orgId: string } }) {
    const visits = await getVisits(params.orgId);

    // Clean helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Visits &amp; Appointments</h2>
                <VisitDialog orgId={params.orgId} />
            </div>

            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter visits..."
                    className="max-w-sm"
                />
            </div>

            <div className="space-y-4">
                {visits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No visits scheduled</p>
                        <p className="text-sm text-muted-foreground">Schedule your first client visit using the button above.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {visits.map((visit) => (
                            <div key={visit.id} className="group relative flex flex-col space-y-2 rounded-lg border p-6 hover:shadow-md transition-shadow bg-card text-card-foreground">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold leading-none tracking-tight">{visit.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{visit.clients?.name}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                ${visit.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            visit.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {visit.status}
                                    </div>
                                </div>

                                <div className="flex items-center text-sm text-muted-foreground mt-2">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {formatDate(visit.scheduled_at)}
                                </div>

                                {visit.clients?.address && (
                                    <div className="flex items-start text-sm text-muted-foreground">
                                        <MapPin className="mr-2 h-4 w-4 mt-0.5" />
                                        <span className="flex-1">{visit.clients.address}</span>
                                    </div>
                                )}

                                {visit.profiles && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Users className="mr-2 h-4 w-4" />
                                        <span className="flex-1">Assigned to: {visit.profiles.full_name}</span>
                                    </div>
                                )}

                                {visit.description && (
                                    <p className="text-sm mt-2 border-t pt-2">{visit.description}</p>
                                )}

                                <div className="mt-4 flex justify-end items-center gap-2 pt-2">
                                    <VisitDialog orgId={params.orgId} visit={visit} />

                                    {visit.status === 'scheduled' && (
                                        <form action={async () => {
                                            "use server"
                                            await updateVisitStatus(params.orgId, visit.id, 'completed')
                                        }}>
                                            <Button variant="outline" size="sm" type="submit" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Complete
                                            </Button>
                                        </form>
                                    )}

                                    <form action={async () => {
                                        "use server"
                                        await deleteVisit(params.orgId, visit.id)
                                    }}>
                                        <Button variant="ghost" size="icon" type="submit" className="text-muted-foreground hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
