"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Server, Globe, Signal, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type HealthStatus = {
    database: {
        status: 'connected' | 'error';
        latency: number;
        message?: string;
    };
    environment: string;
    region: string;
    timestamp: string;
};

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistance } from "date-fns";
import { getAuditLogs } from "@/lib/actions/audit";
import { useToast } from "@/components/ui/use-toast";

export default function SystemStatusPage({ params }: { params: { orgId: string } }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
                <p className="text-muted-foreground">
                    Monitor system performance and track changes.
                </p>
            </div>

            <Tabs defaultValue="monitor" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="monitor">System Monitor</TabsTrigger>
                    <TabsTrigger value="changes">Change Log</TabsTrigger>
                </TabsList>

                <TabsContent value="monitor" className="space-y-4">
                    <SystemMonitor />
                </TabsContent>

                <TabsContent value="changes" className="space-y-4">
                    <ChangeLog orgId={params.orgId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ChangeLog({ orgId }: { orgId: string }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadLogs = () => {
        setLoading(true);
        getAuditLogs(orgId)
            .then(data => {
                setLogs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadLogs();
    }, [orgId]);

    const getChangeDescription = (log: any) => {
        if (!log.previous_data && !log.new_data) return "No details available";

        // Insert
        if (!log.previous_data && log.new_data) {
            return "Created new record";
        }

        // Delete
        if (log.previous_data && !log.new_data) {
            return "Deleted record";
        }

        // Update
        if (log.previous_data && log.new_data) {
            const changes: string[] = [];
            Object.keys(log.new_data).forEach(key => {
                const prev = log.previous_data[key];
                const curr = log.new_data[key];
                // Simple comparison
                if (JSON.stringify(prev) !== JSON.stringify(curr)) {
                    // Start Case the key
                    const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    changes.push(`${fieldName}: ${typeof prev === 'object' ? '...' : prev} → ${typeof curr === 'object' ? '...' : curr}`);
                }
            });
            return changes.length > 0 ? changes.join(", ") : "No changes detected";
        }

        return "N/A";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">Change History</CardTitle>
                <CardDescription>
                    Review recent system changes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        )}
                        {!loading && logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>
                                    <Badge variant={log.action.includes("Reverted") ? "destructive" : "outline"}>
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs max-w-[150px] truncate" title={log.target_resource}>
                                    {log.target_resource}
                                </TableCell>
                                <TableCell className="text-sm max-w-[300px] truncate" title={getChangeDescription(log)}>
                                    {getChangeDescription(log)}
                                </TableCell>
                                <TableCell className="text-sm">{log.actor_name || "Unknown"}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {formatDistance(new Date(log.created_at), new Date(), { addSuffix: true })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function SystemMonitor() {
    const [status, setStatus] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const checkHealth = async () => {
        setLoading(true);
        try {
            const start = performance.now();
            const res = await fetch('/api/health');
            const data = await res.json();

            setStatus(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch health status", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        return status === 'connected' ? "bg-green-500" : "bg-red-500";
    };

    const getLatencyColor = (ms: number) => {
        if (ms < 100) return "text-green-500";
        if (ms < 300) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Database Status Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Database Connectivity
                        </CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            {loading && !status ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <div className={`h-3 w-3 rounded-full ${getStatusColor(status?.database.status || 'error')}`} />
                                    <div className="text-2xl font-bold capitalize">
                                        {status?.database.status || 'Unknown'}
                                    </div>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {status?.database.status === 'error'
                                ? "Connection failed"
                                : "Operational"}
                        </p>
                    </CardContent>
                </Card>

                {/* API Latency Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            API Latency (Server → DB)
                        </CardTitle>
                        <Signal className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading && !status ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <span className={getLatencyColor(status?.database.latency || 0)}>
                                    {status?.database.latency}ms
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Round-trip time to Supabase
                        </p>
                    </CardContent>
                </Card>

                {/* Environment Info Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Environment
                        </CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {status?.region || 'Unknown'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Mode: {status?.environment || 'development'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Health Log</CardTitle>
                            <CardDescription>
                                Recent checks and system events.
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={checkHealth}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <div className="mr-2 h-4 w-4" />}
                            Refresh Now
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div color="green">
                                    <p className="font-medium">System Operational</p>
                                    <p className="text-sm text-muted-foreground">
                                        Last checked: {lastUpdated?.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                                Healthy
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
