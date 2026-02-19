"use client";

import { useState } from "react";
import { createTeam } from "@/lib/actions/workforce";
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
import { Team } from "@/types/app";
import { useRouter } from "next/navigation";

export default function TeamsListClient({ teams: initialTeams, orgId }: { teams: Team[], orgId: string }) {
    // We can use initialTeams to render immediately, and maybe refresh if needed.
    // For now, since it's a server component, we rely on revalidatePath in actions.

    // Actually, createTeam calls revalidatePath, so refreshing params/router might be needed?
    // In strict Server Component architecture, we just receive new props when page reloads.

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <CreateTeamBtn orgId={orgId} />
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
                        {initialTeams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No teams found.</TableCell>
                            </TableRow>
                        ) : (
                            initialTeams.map((team) => (
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
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function CreateTeamBtn({ orgId }: { orgId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const router = useRouter();

    const handleCreate = async () => {
        if (!name) return;
        setLoading(true);
        try {
            await createTeam(orgId, name);
            toast({
                title: "Success",
                description: "Team created successfully.",
            });
            setOpen(false);
            setName("");
            router.refresh(); // Refresh server components
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
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
