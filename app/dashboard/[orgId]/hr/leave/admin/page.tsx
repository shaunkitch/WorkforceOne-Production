import { createClient } from "@/lib/supabase/server";
import { updateLeaveStatus } from "@/lib/actions/hr/leave";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Check, X, Clock } from "lucide-react";
import { ApprovalButtons } from "./ApprovalButtons";

interface PageProps {
    params: { orgId: string };
}

export default async function AdminLeavePage({ params }: PageProps) {
    const supabase = createClient();

    // Fetch all requests for the org
    const { data: requests } = await supabase
        .from("leave_requests")
        .select("*, profiles:user_id(full_name, avatar_url, email)")
        .eq("organization_id", params.orgId)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Leave Approvals</h2>
                <p className="text-muted-foreground">
                    Manage leave requests from your team.
                </p>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!requests || requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No pending requests.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request: any) => (
                                <TableRow key={request.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={request.profiles?.avatar_url} />
                                            <AvatarFallback>{request.profiles?.full_name?.[0] || '?'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{request.profiles?.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{request.profiles?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{request.leave_type}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {format(new Date(request.start_date), "MMM d")} - {format(new Date(request.end_date), "MMM d, yyyy")}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {Math.ceil((new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                                        </div>
                                    </TableCell>
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
                                    <TableCell className="text-right">
                                        {request.status === 'pending' && (
                                            <ApprovalButtons
                                                orgId={params.orgId}
                                                requestId={request.id}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
