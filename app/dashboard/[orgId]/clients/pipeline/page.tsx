import { getQuotes } from "@/lib/actions/quotes";
import { PipelineKanban } from "@/components/crm/PipelineKanban";

interface PageProps {
    params: { orgId: string };
}

export const metadata = {
    title: "Pipeline | WorkforceOne",
    description: "Visual deal pipeline and quote management board.",
};

export default async function PipelinePage({ params }: PageProps) {
    const quotes = await getQuotes(params.orgId);

    const totalValue = quotes.reduce((sum, q) => sum + (q.total_amount || 0), 0);

    const columns = [
        { id: "draft", label: "Draft", color: "bg-slate-100 border-slate-300" },
        { id: "sent", label: "Sent", color: "bg-blue-50 border-blue-300" },
        { id: "approved", label: "Approved", color: "bg-green-50 border-green-300" },
        { id: "invoiced", label: "Invoiced", color: "bg-purple-50 border-purple-300" },
        { id: "paid", label: "Paid", color: "bg-emerald-50 border-emerald-300" },
        { id: "rejected", label: "Rejected", color: "bg-red-50 border-red-300" },
    ];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pipeline</h2>
                    <p className="text-muted-foreground">
                        {quotes.length} deal{quotes.length !== 1 ? "s" : ""} &mdash; total pipeline value{" "}
                        <span className="font-semibold text-foreground">
                            ${totalValue.toLocaleString()}
                        </span>
                    </p>
                </div>
            </div>

            <PipelineKanban
                orgId={params.orgId}
                quotes={quotes}
                columns={columns}
            />
        </div>
    );
}
