
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
import { Badge } from "@/components/ui/badge";
import { getPayrollRunDetails } from "@/lib/actions/hr/payroll";
import { getOrganization } from "@/lib/actions/organizations";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import PayslipDialog from "./PayslipDialog";

export default async function PayrollRunDetails({ params }: { params: { orgId: string; payrollId: string } }) {
    const details = await getPayrollRunDetails(params.payrollId);
    const org = await getOrganization(params.orgId);
    const currency = org?.currency || "USD";

    if (!details || !details.run) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div>Payroll run not found</div>
                <Button variant="outline" asChild>
                    <Link href={`/dashboard/${params.orgId}/hr/payroll`}>Back to List</Link>
                </Button>
            </div>
        );
    }

    const { run, items } = details;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/${params.orgId}/hr/payroll`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{run.title}</h2>
                        <p className="text-muted-foreground">
                            {format(new Date(run.period_start), "MMM do")} - {format(new Date(run.period_end), "MMM do, yyyy")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={run.status === "paid" ? "secondary" : "outline"} className="text-lg px-4 py-1">
                        {run.status.toUpperCase()}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {currency} {run.total_amount?.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {items.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Created On</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sm">
                            {format(new Date(run.created_at), "PPP")}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payslips</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Total Hours</TableHead>
                                <TableHead>Hourly Rate</TableHead>
                                <TableHead>Gross Pay</TableHead>
                                <TableHead>Net Pay</TableHead>
                                <TableHead className="w-[100px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.profiles?.full_name || "Unknown"}</div>
                                        <div className="text-xs text-muted-foreground">{item.profiles?.email}</div>
                                    </TableCell>
                                    <TableCell>{item.total_hours}</TableCell>
                                    <TableCell>{currency} {item.hourly_rate?.toFixed(2)}</TableCell>
                                    <TableCell>{currency} {item.gross_pay?.toLocaleString()}</TableCell>
                                    <TableCell className="font-bold">{currency} {item.net_pay?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <PayslipDialog org={org} run={run} item={item} currency={currency} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">No payroll items found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
