"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPayrollRuns } from "@/lib/actions/hr/payroll";
import { getOrganization, updateOrganization } from "@/lib/actions/organizations";
import CreatePayrollDialog from "./CreatePayrollDialog";
import { Badge } from "@/components/ui/badge";

export default function PayrollDashboard({ params }: { params: { orgId: string } }) {
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState("USD");
    const [updatingCurrency, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    const loadRuns = async () => {
        setLoading(true);
        try {
            const [data, org] = await Promise.all([
                getPayrollRuns(params.orgId),
                getOrganization(params.orgId)
            ]);
            setRuns(data);
            if (org) {
                // Fixed: org returned from getOrganization is the object itself, not { org: ... }
                setCurrency(org.currency || "USD");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRuns();
    }, [params.orgId]);

    const handleCurrencyChange = (newCurrency: string) => {
        setCurrency(newCurrency);
        startTransition(async () => {
            try {
                await updateOrganization(params.orgId, { currency: newCurrency });
                toast({
                    title: "Currency Updated",
                    description: `Default currency set to ${newCurrency}`,
                });
            } catch (error) {
                console.error("Failed to update currency", error);
                toast({
                    title: "Error",
                    description: "Failed to update currency settings",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Payroll</h2>
                <div className="flex items-center gap-2">
                    <Select value={currency} onValueChange={handleCurrencyChange} disabled={updatingCurrency}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="CAD">CAD ($)</SelectItem>
                            <SelectItem value="AUD">AUD ($)</SelectItem>
                            <SelectItem value="JPY">JPY (¥)</SelectItem>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="ZAR">ZAR (R)</SelectItem>
                        </SelectContent>
                    </Select>
                    <CreatePayrollDialog orgId={params.orgId} onSuccess={loadRuns} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Run Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {currency} {runs[0]?.total_amount?.toLocaleString() || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {runs[0] ? format(new Date(runs[0].created_at), "MMM do, yyyy") : "No runs yet"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Run Title</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Pay</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>}
                            {!loading && runs.map((run) => (
                                <TableRow key={run.id}>
                                    <TableCell className="font-medium">{run.title}</TableCell>
                                    <TableCell>
                                        {format(new Date(run.period_start), "MMM d")} - {format(new Date(run.period_end), "MMM d")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={run.status === "paid" ? "secondary" : "outline"}>
                                            {run.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{currency} {run.total_amount?.toLocaleString()}</TableCell>
                                    <TableCell>{format(new Date(run.created_at), "MMM d, yyyy")}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/${params.orgId}/hr/payroll/${run.id}`)}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && runs.length === 0 && (
                                <TableRow><TableCell colSpan={6} className="text-center py-4">No payroll runs found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
