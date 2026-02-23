"use client";

import { useState, useEffect } from "react";
import { getAuditLogs } from "@/lib/actions/audit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { Loader2, Activity } from "lucide-react";

function generateHumanReadableDiff(log: any) {
    const { action, actor_name, previous_data, new_data, target_resource } = log;
    const actor = actor_name || log.actor_email || "System";

    // Fallback sentence
    let sentence = `${actor} performed ${action} on ${target_resource}.`;

    try {
        if (action.includes('UPDATE')) {
            let changes = [];
            if (previous_data && new_data) {
                for (const key in new_data) {
                    if (JSON.stringify(new_data[key]) !== JSON.stringify(previous_data[key]) && key !== 'updated_at') {
                        const oldVal = typeof previous_data[key] === 'object' ? JSON.stringify(previous_data[key]) : previous_data[key];
                        const newVal = typeof new_data[key] === 'object' ? JSON.stringify(new_data[key]) : new_data[key];
                        changes.push(`changed ${key} from '${oldVal || 'empty'}' to '${newVal}'`);
                    }
                }
            }
            if (changes.length > 0) {
                sentence = `${actor} updated ${target_resource.split('/').pop()}: ${changes.join(', ')}.`;
            } else {
                sentence = `${actor} updated a record in ${target_resource}.`;
            }
        } else if (action.includes('CREATE') || action.includes('INSERT')) {
            sentence = `${actor} created a new record in ${target_resource.split('/')[0] || target_resource}.`;
        } else if (action.includes('DELETE')) {
            sentence = `${actor} deleted a record from ${target_resource.split('/')[0] || target_resource}.`;
        }
    } catch (e) { /* fallback string holds */ }

    return sentence;
}

export default function AuditLogPage({ params }: { params: { orgId: string } }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getAuditLogs(params.orgId)
            .then(data => {
                setLogs(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [params.orgId]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
                <p className="text-muted-foreground">View recent security and administrative events.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Recent Activity</CardTitle>
                    <CardDescription>Records of critical actions taken within the organization.</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && <div className="text-destructive mb-4">Error loading logs: {error}</div>}
                    <div className="pt-4">
                        {loading ? (
                            <div className="flex items-center justify-center p-8 text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Loading timeline...</span>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-slate-50">
                                <Activity className="h-8 w-8 text-slate-300 mb-2" />
                                <span className="text-muted-foreground">No recent activity found.</span>
                            </div>
                        ) : (
                            <div className="relative border-l border-muted ml-3 space-y-8 pb-4">
                                {logs.map((log) => (
                                    <div key={log.id} className="relative pl-6">
                                        <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm font-medium text-foreground">
                                                {generateHumanReadableDiff(log)}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-2">
                                                {formatDistance(new Date(log.created_at), new Date(), { addSuffix: true })}
                                                &middot; {log.actor_email}
                                                &middot; <span className="font-mono bg-slate-100 rounded px-1">{log.action}</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
