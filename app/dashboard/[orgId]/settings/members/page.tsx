"use client";

import { useState, useEffect, useTransition } from "react";
import { inviteMember, getOrganizationMembers } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Plus, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function MembersPage({ params }: { params: { orgId: string } }) {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOrganizationMembers(params.orgId).then((data) => {
            setMembers(data);
            setLoading(false);
        });
    }, [params.orgId]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Members</h2>
                    <p className="text-muted-foreground">Manage who has access to this organization.</p>
                </div>
                <InviteMemberBtn orgId={params.orgId} />
            </div>

            <div className="grid gap-4">
                {loading && <div>Loading members...</div>}
                {!loading && members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarFallback>{(member.profiles?.full_name || member.user_id).substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{member.profiles?.full_name || "Unknown User"}</p>
                                <p className="text-sm text-muted-foreground">{member.profiles?.email || member.user_id}</p>
                            </div>
                        </div>
                        <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium capitalize">
                            {member.role}
                        </div>
                    </div>
                ))}
                {!loading && members.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">No members found (unlikely if you are here).</div>
                )}
            </div>
        </div>
    );
}

function InviteMemberBtn({ orgId }: { orgId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, startTransition] = useTransition();
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"admin" | "editor" | "viewer">("viewer");

    const handleInvite = () => {
        if (!email) return;
        startTransition(async () => {
            try {
                await inviteMember(orgId, email, role);
                toast({
                    title: "Success",
                    description: "Member added successfully (mocked)",
                });
                setOpen(false);
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || "Something went wrong",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                    <DialogDescription>
                        Add a new member to your organization. They must already have an account.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Select value={role} onValueChange={(val: any) => setRole(val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvite} disabled={loading}>
                        {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                        Add Member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
