
import { getTimeEntries } from "@/lib/actions/hr";
import { format } from "date-fns";
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

export default async function TimesheetPage({ params }: { params: { orgId: string } }) {
    const entries = await getTimeEntries(params.orgId);

    // Calculate simple stats
    const totalEntries = entries.length;
    const totalHours = entries.reduce((acc: number, curr: any) => acc + (curr.duration_minutes || 0), 0) / 60;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">My Timesheet</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalHours.toFixed(1)} hrs</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Clock In</TableHead>
                                <TableHead>Clock Out</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map((entry: any) => (
                                <TableRow key={entry.id}>
                                    <TableCell>{format(new Date(entry.clock_in), "PPP")}</TableCell>
                                    <TableCell>{format(new Date(entry.clock_in), "p")}</TableCell>
                                    <TableCell>
                                        {entry.clock_out ? format(new Date(entry.clock_out), "p") : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {entry.duration_minutes
                                            ? `${Math.floor(entry.duration_minutes / 60)}h ${entry.duration_minutes % 60}m`
                                            : (entry.clock_out ? "0m" : "Running...")}
                                    </TableCell>
                                    <TableCell>
                                        {entry.clock_out ? (
                                            <Badge variant="secondary">Completed</Badge>
                                        ) : (
                                            <Badge variant="default" className="bg-green-600">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={entry.notes}>
                                        {entry.notes || "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {entries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No time entries found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
