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
                            <TableHead>Content</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.map((submission) => {
                            const content = JSON.parse(submission.content);
                            // We could try to map keys to labels if we fetched the form structure, 
                            // but for now let's just dump the raw JSON or first few keys.

                            return (
                                <TableRow key={submission.id}>
                                    <TableCell className="text-muted-foreground w-[200px]">
                                        {formatDistance(new Date(submission.created_at), new Date(), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm">
                                            {Object.keys(content).map(key => (
                                                <div key={key} className="flex gap-2">
                                                    <span className="font-semibold">{key}:</span>
                                                    <span>{content[key]}</span>
                                                </div>
                                            ))}
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
