"use client";

import { useRouter } from "next/navigation";

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
            🖨️ Print / Save PDF
        </button>
    );
}

export function BackButton({ href }: { href: string }) {
    const router = useRouter();
    return (
        <button
            onClick={() => router.push(href)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
            ← Back
        </button>
    );
}
