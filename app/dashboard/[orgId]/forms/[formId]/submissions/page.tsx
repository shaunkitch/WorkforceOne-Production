import { getFormSubmissions } from "@/lib/actions/forms/submissions";
import { formatDistance } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FormElementInstance } from "@/types/forms";

export default async function SubmissionsPage({
    params,
}: {
    params: { formId: string };
}) {
    const submissions = await getFormSubmissions(params.formId);

    return (
        <div className="py-4">
            <h2 className="text-2xl font-bold mb-4">Submissions</h2>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Submitted By</TableHead>
                            <TableHead>Context (Client/Visit)</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Content</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.map((submission: any) => {
                            const content = typeof submission.content === 'string'
                                ? JSON.parse(submission.content)
                                : submission.content || {}; // Handle if it's already jsonb or null

                            const location = submission.location;
                            const mapUrl = location
                                ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
                                : null;

                            return (
                                <TableRow key={submission.id}>
                                    <TableCell className="text-muted-foreground whitespace-nowrap">
                                        {formatDistance(new Date(submission.created_at), new Date(), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{submission.profiles?.full_name || 'Unknown User'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            {submission.visits?.title && (
                                                <span className="font-medium text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded w-fit mb-1">
                                                    {submission.visits.title}
                                                </span>
                                            )}
                                            <span className="text-sm">{submission.clients?.name || '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {mapUrl ? (
                                            <a
                                                href={mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-blue-600 hover:underline text-xs"
                                            >
                                                View Map
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">No location</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm max-w-md">
                                            {Object.keys(content).slice(0, 5).map(key => (
                                                <div key={key} className="grid grid-cols-[100px_1fr] gap-2">
                                                    <span className="font-semibold text-xs truncate text-muted-foreground" title={key}>{key}:</span>
                                                    <span className="truncate">{String(content[key])}</span>
                                                </div>
                                            ))}
                                            {Object.keys(content).length > 5 && (
                                                <span className="text-xs text-muted-foreground italic">...and {Object.keys(content).length - 5} more fields</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {submissions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
