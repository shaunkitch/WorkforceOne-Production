import { QuoteBuilder } from "@/components/quotes/quote-builder";
import { getQuotes, deleteQuote, updateQuoteStatus } from "@/lib/actions/quotes";
import { Trash2, FileText, Send, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function QuotesPage({ params }: { params: { orgId: string } }) {
  const quotes = await getQuotes(params.orgId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Quotes &amp; Estimates</h2>
        <QuoteBuilder orgId={params.orgId} />
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Filter quotes..."
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
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
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center">
                    No quotes found. Create a new quote to get started.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-mono text-xs">#{quote.number}</td>
                    <td className="p-4 align-middle font-medium">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        {quote.title}
                      </div>
                    </td>
                    <td className="p-4 align-middle">{quote.clients?.name}</td>
                    <td className="p-4 align-middle">{formatDate(quote.created_at)}</td>
                    <td className="p-4 align-middle font-bold">${quote.total_amount.toFixed(2)}</td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold
                            ${quote.status === 'approved' ? 'bg-green-100 text-green-700' :
                          quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'}`}>
                        {quote.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-1">
                        {quote.status === 'draft' && (
                          <form action={async () => {
                            "use server"
                            await updateQuoteStatus(params.orgId, quote.id, 'sent')
                          }}>
                            <Button variant="ghost" size="icon" type="submit" title="Mark Sent">
                              <Send className="h-4 w-4 text-blue-500" />
                            </Button>
                          </form>
                        )}

                        {(quote.status === 'sent' || quote.status === 'draft') && (
                          <form action={async () => {
                            "use server"
                            await updateQuoteStatus(params.orgId, quote.id, 'approved')
                          }}>
                            <Button variant="ghost" size="icon" type="submit" title="Mark Approved">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          </form>
                        )}

                        <form action={async () => {
                          "use server"
                          await deleteQuote(params.orgId, quote.id)
                        }}>
                          <Button variant="ghost" size="icon" type="submit">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </form>
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
