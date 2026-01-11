"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { clockIn, clockOut, getLastTimeEntry } from "@/lib/actions/hr";
import { Loader2, Play, Square, Timer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { differenceInSeconds } from "date-fns";

export default function TimeClock({ orgId }: { orgId: string }) {
    const [status, setStatus] = useState<"idle" | "running">("idle");
    const [entry, setEntry] = useState<any>(null);
    const [elapsed, setElapsed] = useState(0);
    const [loading, startTransition] = useTransition();
    const { toast } = useToast();

    const fetchStatus = async () => {
        try {
            const last = await getLastTimeEntry(orgId);
            if (last && !last.clock_out) {
                setStatus("running");
                setEntry(last);
            } else {
                setStatus("idle");
                setEntry(null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [orgId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === "running" && entry) {
            interval = setInterval(() => {
                const start = new Date(entry.clock_in);
                const now = new Date();
                setElapsed(differenceInSeconds(now, start));
            }, 1000);
        } else {
            setElapsed(0);
        }
        return () => clearInterval(interval);
    }, [status, entry]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleToggle = () => {
        startTransition(async () => {
            try {
                if (status === "idle") {
                    await clockIn(orgId); // Allow adding notes/location later
                    toast({ title: "Clocked In", description: "Your timer has started." });
                    await fetchStatus();
                } else {
                    await clockOut(orgId);
                    toast({ title: "Clocked Out", description: "Time entry saved." });
                    await fetchStatus();
                }
            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        });
    };

    if (loading && !entry && status === "idle") return null; // Initial load or transition

    return (
        <div className="flex items-center gap-4 bg-muted/50 px-4 py-2 rounded-full border">
            {status === "running" && (
                <div className="flex items-center gap-2 text-sm font-mono font-medium text-primary animate-pulse">
                    <Timer className="h-4 w-4" />
                    {formatTime(elapsed)}
                </div>
            )}

            <Button
                size="sm"
                variant={status === "running" ? "destructive" : "default"}
                onClick={handleToggle}
                disabled={loading}
                className={status === "running" ? "w-32" : "w-32 bg-green-600 hover:bg-green-700"}
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    status === "running" ? (
                        <>
                            <Square className="h-3 w-3 mr-2 fill-current" /> Stop
                        </>
                    ) : (
                        <>
                            <Play className="h-3 w-3 mr-2 fill-current" /> Clock In
                        </>
                    )
                )}
            </Button>
        </div>
    );
}
