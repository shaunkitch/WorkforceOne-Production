"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

interface PayslipProps {
    org: any;
    run: any;
    item: any;
    currency: string;
}

export default function PayslipDialog({ org, run, item, currency }: PayslipProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '', 'width=800,height=600');
        if (!printWindow) return;

        printWindow.document.write('<html><head><title>Payslip</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            body { font-family: sans-serif; padding: 20px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .company-info { text-align: left; }
            .payslip-title { text-align: right; }
            .section { margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f9f9f9; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 10px; border-top: 1px solid #333; padding-top: 10px; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">View Payslip</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Payslip Preview</DialogTitle>
                </DialogHeader>

                <div ref={printRef} className="p-4 border rounded-lg bg-white text-sm">
                    {/* Print-friendly Layout */}
                    <div className="flex justify-between items-start border-b pb-6 mb-6">
                        <div className="space-y-1">
                            {org.logo_url && (
                                <img src={org.logo_url} alt="Logo" className="h-10 w-auto mb-2 object-contain" />
                            )}
                            <h3 className="font-bold text-lg">{org.name}</h3>
                            <p className="text-gray-500">Payslip Period: {format(new Date(run.period_start), 'MMM d')} - {format(new Date(run.period_end), 'MMM d, yyyy')}</p>
                            <p className="text-gray-500">Paid On: {run.status === 'paid' ? format(new Date(), 'PPP') : 'Draft'}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <h2 className="text-2xl font-bold text-gray-800">PAYSLIP</h2>
                            <p className="font-medium">{item.profiles?.full_name}</p>
                            <p className="text-gray-500">{item.profiles?.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                            <h4 className="font-bold border-b mb-2 pb-1">Earnings</h4>
                            <div className="flex justify-between py-1">
                                <span>Regular Pay ({item.total_hours} hrs @ {currency}{item.hourly_rate})</span>
                                <span>{currency}{item.gross_pay?.toFixed(2)}</span>
                            </div>
                            {Number(item.bonuses) > 0 && (
                                <div className="flex justify-between py-1">
                                    <span>Bonuses</span>
                                    <span>{currency}{item.bonuses?.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold border-b mb-2 pb-1">Deductions</h4>
                            <div className="flex justify-between py-1">
                                <span>Tax / Deductions</span>
                                <span>{currency}{item.deductions?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                        <div className="w-1/2 flex justify-between items-center">
                            <span className="font-bold text-lg">Net Pay</span>
                            <span className="font-bold text-xl">{currency}{item.net_pay?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print / Save PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
