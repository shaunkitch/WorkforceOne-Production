import { Suspense } from "react";
import { getOrganizationMembers } from "@/lib/actions/users";
import { getOrganization } from "@/lib/actions/organizations";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Client Components
import {
    BulkImportBtn,
    NotifyAllDialog,
    CreateUserBtn,
    SendNotificationDialog,
    EditUserDialog,
    DeleteUserBtn
} from "./user-actions";

export default async function UserDirectoryPage({ params }: { params: { orgId: string } }) {
    // Parallel Fetching
    const [members, organization] = await Promise.all([
        getOrganizationMembers(params.orgId),
        getOrganization(params.orgId)
    ]);

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <BulkImportBtn orgId={params.orgId} />
                <NotifyAllDialog orgId={params.orgId} />
                <CreateUserBtn orgId={params.orgId} currency={organization?.currency} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Emp #</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-mono text-sm">{member.employee_number || "-"}</TableCell>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{(member.profiles?.full_name || member.user_id || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        {member.profiles?.full_name || "Unknown"}
                                    </TableCell>
                                    <TableCell>{member.profiles?.email}</TableCell>
                                    <TableCell>{member.profiles?.mobile || "-"}</TableCell>
                                    <TableCell className="capitalize">{member.role}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <SendNotificationDialog orgId={params.orgId} userId={member.user_id} userName={member.profiles?.full_name || "User"} />
                                        <EditUserDialog orgId={params.orgId} user={member} currency={organization?.currency} />
                                        <DeleteUserBtn orgId={params.orgId} userId={member.user_id} />
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
