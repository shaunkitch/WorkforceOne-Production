import { getInvoice } from "@/lib/actions/invoices";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PrintButton, BackButton } from "./print-button";
import { getOrganization } from "@/lib/actions/organizations";

export default async function InvoiceDetailPage({
    params,
}: {
    params: { orgId: string; invoiceId: string };
}) {
    const [invoice, org] = await Promise.all([
        getInvoice(params.orgId, params.invoiceId),
        getOrganization(params.orgId),
    ]);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString([], {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {/* Toolbar - hidden when printing */}
            <div className="flex items-center justify-between print:hidden">
                <BackButton href={`/dashboard/${params.orgId}/invoices`} />
                <PrintButton />
            </div>

            {/* Invoice Card */}
            <div className="max-w-3xl mx-auto bg-card border rounded-lg p-10 shadow-sm print:shadow-none print:border-none">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        {org?.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={org.logo_url} alt={org.name} className="h-12 mb-2 object-contain" />
                        )}
                        <h1 className="text-2xl font-bold">{org?.name}</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-primary">INVOICE</p>
                        <p className="text-muted-foreground font-mono">#{invoice.number}</p>
                    </div>
                </div>

                <Separator className="mb-6" />

                {/* Bill To */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bill To</p>
                        <p className="font-semibold">{invoice.clients?.name}</p>
                        {invoice.clients?.email && <p className="text-sm text-muted-foreground">{invoice.clients.email}</p>}
                        {invoice.clients?.address && <p className="text-sm text-muted-foreground">{invoice.clients.address}</p>}
                        {invoice.clients?.phone && <p className="text-sm text-muted-foreground">{invoice.clients.phone}</p>}
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Details</p>
                        <p className="text-sm"><span className="text-muted-foreground">Date: </span>{formatDate(invoice.created_at)}</p>
                        {invoice.valid_until && (
                            <p className="text-sm"><span className="text-muted-foreground">Due: </span>{formatDate(invoice.valid_until)}</p>
                        )}
                        <p className="text-sm mt-1">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${invoice.status === "paid" ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"
                                }`}>
                                {invoice.status.toUpperCase()}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Title */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">{invoice.title}</h2>
                </div>

                {/* Line Items */}
                <div className="rounded-md border mb-6">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Qty</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Unit Price</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item: { id: string; description: string; quantity: number; unit_price: number; total_price: number }) => (
                                <tr key={item.id} className="border-t">
                                    <td className="px-4 py-3">{item.description}</td>
                                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.total_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64">
                        <div className="flex justify-between py-2 text-lg font-bold border-t">
                            <span>Total</span>
                            <span>{formatCurrency(invoice.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <Separator className="mt-8 mb-4" />
                <p className="text-center text-xs text-muted-foreground">
                    Thank you for your business.
                </p>
            </div>
        </div>
    );
}
