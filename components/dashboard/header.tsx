"use client";

import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "./notifications-popover";
import { User } from "@supabase/supabase-js";
import { LogOut, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import TimeClock from "@/components/hr/TimeClock";
import { useSidebar } from "./sidebar-context";

interface HeaderProps {
    user: User;
    orgName: string;
}

export function Header({ user, orgName }: HeaderProps) {
    const supabase = createClient();
    const router = useRouter();
    const { toggle } = useSidebar();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <div className="h-14 lg:h-16 border-b px-3 lg:px-4 flex items-center justify-between bg-white dark:bg-slate-950 shrink-0">
            {/* Left: hamburger (mobile only) + org name */}
            <div className="flex items-center gap-2 lg:gap-4 min-w-0">
                <button
                    onClick={toggle}
                    className="lg:hidden p-2 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <h2 className="text-base lg:text-lg font-semibold truncate">{orgName}</h2>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1 lg:gap-4 shrink-0">
                <NotificationsPopover />
                <TimeClockWrapper />
                <span className="text-sm text-muted-foreground hidden md:block truncate max-w-[180px]">
                    {user.email}
                </span>
                <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}

function TimeClockWrapper() {
    const params = useParams();
    const orgId = params.orgId as string;
    if (!orgId) return null;
    return <TimeClock orgId={orgId} />;
}
