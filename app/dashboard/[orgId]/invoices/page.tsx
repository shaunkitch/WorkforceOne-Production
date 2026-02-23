import { getInvoices, markInvoicePaid, revertInvoiceToQuote } from "@/lib/actions/invoices";
import { FileText, Undo2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function InvoicesPage({ params }: { params: { orgId: string } }) {
    const invoices = await getInvoices(params.orgId);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Number</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Client</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No invoices yet. Convert a quote to generate an invoice.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-mono text-xs">#{invoice.number}</td>
                                        <td className="p-4 align-middle font-medium">
                                            <div className="flex items-center">
                                                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <Link href={`/dashboard/${params.orgId}/invoices/${invoice.id}`} className="hover:underline">
                                                    {invoice.title}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">{invoice.clients?.name}</td>
                                        <td className="p-4 align-middle">{formatDate(invoice.created_at)}</td>
                                        <td className="p-4 align-middle font-bold">{formatCurrency(invoice.total_amount)}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${invoice.status === "paid" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                }`}>
                                                {invoice.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex justify-end gap-1">
                                                {invoice.status !== "paid" && (
                                                    <form action={async () => {
                                                        "use server";
                                                        await markInvoicePaid(params.orgId, invoice.id);
                                                    }}>
                                                        <Button variant="ghost" size="icon" type="submit" title="Mark Paid">
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                    </form>
                                                )}
                                                <form action={async () => {
                                                    "use server";
                                                    await revertInvoiceToQuote(params.orgId, invoice.id);
                                                }}>
                                                    <Button variant="ghost" size="icon" type="submit" title="Revert to Quote">
                                                        <Undo2 className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </form>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/dashboard/${params.orgId}/invoices/${invoice.id}`}>View</Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
