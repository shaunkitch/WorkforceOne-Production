"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { updateLeaveStatus } from "@/lib/actions/hr/leave";
import { toast } from "@/components/ui/use-toast";

export function ApprovalButtons({ orgId, requestId }: { orgId: string, requestId: string }) {
    const [loading, startTransition] = useTransition();

    const handleAction = (status: 'approved' | 'rejected') => {
        startTransition(async () => {
            try {
                await updateLeaveStatus(orgId, requestId, status);
                toast({ title: `Request ${status}` });
            } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="flex justify-end gap-2">
            <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleAction('rejected')}
                disabled={loading}
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-green-500 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleAction('approved')}
                disabled={loading}
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
        </div>
    );
}
