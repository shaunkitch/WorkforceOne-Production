"use client";

import { useState, useEffect } from "react";
import { getAuditLogs } from "@/lib/actions/audit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDistance } from "date-fns";
import { Loader2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Action</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</TableCell>
                                </TableRow>
                            )}
                            {!loading && logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No logs found.</TableCell>
                                </TableRow>
                            )}
                            {!loading && logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <Badge variant="outline">{log.action}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{log.actor_name}</span>
                                            <span className="text-xs text-muted-foreground">{log.actor_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{log.target_resource}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDistance(new Date(log.created_at), new Date(), { addSuffix: true })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
