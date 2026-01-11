"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function UsersLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { orgId: string };
}) {
    const pathname = usePathname();
    const baseUrl = `/dashboard/${params.orgId}/users`;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Workforce</h2>
                <p className="text-muted-foreground">Manage your team members and groups.</p>
            </div>

            <div className="border-b">
                <nav className="flex gap-4">
                    <Link
                        href={baseUrl}
                        className={cn(
                            "pb-2 border-b-2 transition-colors",
                            pathname === baseUrl
                                ? "border-primary font-semibold text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Directory
                    </Link>
                    <Link
                        href={`${baseUrl}/teams`}
                        className={cn(
                            "pb-2 border-b-2 transition-colors",
                            pathname.includes("/teams")
                                ? "border-primary font-semibold text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Teams
                    </Link>
                </nav>
            </div>
            {children}
        </div>
    );
}
