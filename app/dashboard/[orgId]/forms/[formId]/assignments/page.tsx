"use client";

import { useState, useEffect, useTransition } from "react";
import { assignForm, getFormAssignments } from "@/lib/actions/assignments";
import { getOrganizationMembers } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistance } from "date-fns";

export default function AssignmentsPage({ params }: { params: { orgId: string; formId: string } }) {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = () => {
        getFormAssignments(params.formId).then((data) => {
            setAssignments(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        refresh();
    }, [params.formId]);

    return (
        <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Assignments</h2>
                <AssignUserBtn orgId={params.orgId} formId={params.formId} onSuccess={refresh} />
            </div>

            <div className="border rounded-md divide-y">
                {loading && <div className="p-4">Loading assignments...</div>}
                {!loading && assignments.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No users assigned to this form yet.
                    </div>
                )}
                {assignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>{(assignment.profiles?.full_name || "?").substring(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{assignment.profiles?.full_name || "Unknown User"}</p>
                                <p className="text-xs text-muted-foreground">Assigned {formatDistance(new Date(assignment.created_at), new Date(), { addSuffix: true })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${assignment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {assignment.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AssignUserBtn({ orgId, formId, onSuccess }: { orgId: string, formId: string, onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, startTransition] = useTransition();
    const [members, setMembers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");

    useEffect(() => {
        if (open) {
            getOrganizationMembers(orgId).then(setMembers);
        }
    }, [open, orgId]);

    const handleAssign = () => {
        if (!selectedUserId) return;
        startTransition(async () => {
            try {
                await assignForm(formId, selectedUserId);
                toast({
                    title: "Success",
                    description: "Form assigned to user",
                });
                setOpen(false);
                onSuccess();
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to assign",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Assign User
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Form</DialogTitle>
                    <DialogDescription>
                        Assign this form to a member of your organization to complete.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Member</label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a user..." />
                            </SelectTrigger>
                            <SelectContent>
                                {members.map((m) => (
                                    <SelectItem key={m.user_id} value={m.user_id}>
                                        {m.profiles?.full_name || m.profiles?.email || m.user_id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAssign} disabled={loading || !selectedUserId}>
                        {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                        Assign
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
