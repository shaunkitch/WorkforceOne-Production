import { createClient } from "@/lib/supabase/server";
import { RequestLeaveDialog } from "./RequestLeaveDialog";
import { getLeaveRequests } from "@/lib/actions/hr/leave";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
    params: { orgId: string };
}

export default async function LeavePage({ params }: PageProps) {
    const requests = await getLeaveRequests(params.orgId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // Simple check - in a real app use roles
    const { data: member } = await supabase.from('organization_members').select('role').eq('organization_id', params.orgId).eq('user_id', user?.id).single();
    const isAdmin = member?.role === 'owner' || member?.role === 'admin';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
                    <p className="text-muted-foreground">
                        View your leave balance and request time off.
                    </p>
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <Link href={`/dashboard/${params.orgId}/hr/leave/admin`}>
                            <Button variant="outline">Manage Requests</Button>
                        </Link>
                    )}
                    <RequestLeaveDialog />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Annual Leave Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">15 Days</div>
                        <p className="text-xs text-muted-foreground">Available</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sick Leave Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2 Days</div>
                        <p className="text-xs text-muted-foreground">This cycle</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reason</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No leave requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request: any) => {
                                const start = new Date(request.start_date);
                                const end = new Date(request.end_date);
                                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                                return (
                                    <TableRow key={request.id}>
                                        <TableCell className="capitalize font-medium">{request.leave_type}</TableCell>
                                        <TableCell>
                                            {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>{days} days</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                request.status === 'approved' ? 'default' :
                                                    request.status === 'rejected' ? 'destructive' : 'secondary'
                                            }>
                                                {request.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                            {request.reason || '-'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
