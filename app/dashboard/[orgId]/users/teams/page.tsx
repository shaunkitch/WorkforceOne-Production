"use client";

import { useState, useEffect, useTransition } from "react";
import { createTeam, getTeams } from "@/lib/actions/workforce";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, Users } from "lucide-react";
import { formatDistance } from "date-fns";

export default function TeamsPage({ params }: { params: { orgId: string } }) {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = () => {
        getTeams(params.orgId).then((data) => {
            setTeams(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        refresh();
    }, [params.orgId]);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <CreateTeamBtn orgId={params.orgId} onSuccess={refresh} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        )}
                        {!loading && teams.map((team) => (
                            <TableRow key={team.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    {team.name}
                                </TableCell>
                                <TableCell>{formatDistance(new Date(team.created_at), new Date(), { addSuffix: true })}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Manage</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && teams.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No teams found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function CreateTeamBtn({ orgId, onSuccess }: { orgId: string, onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, startTransition] = useTransition();
    const [name, setName] = useState("");

    const handleCreate = () => {
        if (!name) return;
        startTransition(async () => {
            try {
                await createTeam(orgId, name);
                toast({
                    title: "Success",
                    description: "Team created successfully.",
                });
                setOpen(false);
                setName("");
                onSuccess();
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Team
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Team</DialogTitle>
                    <DialogDescription>
                        Create a new team to organize your workforce.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Team Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Field Technicians" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={loading}>
                        {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
