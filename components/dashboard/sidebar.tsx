"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { X } from "lucide-react";
import {
    LayoutDashboard,
    FileText,
    Settings,
    Users,
    BarChart3,
    BarChart2,
    Clock,
    Banknote,
    MapPin,
    Package,
    Briefcase,
    CalendarDays,
    Calendar,
    Receipt,
    ShieldCheck,
    AlertTriangle,
    ScanLine,
    ClipboardList,
    GitBranch,
    PieChart,
    ClipboardCheck,
} from "lucide-react";

interface SidebarProps {
    orgId: string;
    brandColor?: string | null;
    logoUrl?: string | null;
    orgName?: string;
    features?: any;
}

export function Sidebar({ orgId, brandColor, logoUrl, orgName = "WorkforceOne", features = {} }: SidebarProps) {
    const pathname = usePathname();
    const { isOpen, close } = useSidebar();

    // Auto-close drawer on route change (mobile)
    useEffect(() => {
        close();
    }, [pathname, close]);

    const groups = [
        {
            label: "General",
            routes: [
                { label: "Overview", icon: LayoutDashboard, href: "", exact: true },
                { label: "Analytics", icon: BarChart3, href: "/analytics" },
                { label: "Forms", icon: FileText, href: "/forms" },
                { label: "Visits", icon: CalendarDays, href: "/visits" },
            ],
        },
        {
            label: "Operations",
            visible: features.operations,
            routes: [
                { label: "Sites & Locations", icon: MapPin, href: "/sites" },
                { label: "Inventory", icon: Package, href: "/inventory" },
            ],
        },
        {
            label: "CRM",
            visible: features.crm,
            routes: [
                { label: "Clients", icon: Briefcase, href: "/clients", exact: true },
                { label: "Pipeline", icon: GitBranch, href: "/clients/pipeline" },
                { label: "Quotes", icon: Receipt, href: "/quotes" },
                { label: "Invoices", icon: Banknote, href: "/invoices" },
            ],
        },
        {
            label: "HR & Payroll",
            visible: features.payroll,
            routes: [
                { label: "Users", icon: Users, href: "/users" },
                { label: "Timesheets", icon: Clock, href: "/hr/timesheet" },
                { label: "Attendance Analytics", icon: BarChart2, href: "/hr/attendance" },
                { label: "Anomaly Detection", icon: AlertTriangle, href: "/hr/anomalies" },
                { label: "Expenses", icon: Receipt, href: "/hr/expenses" },
                { label: "Leave Management", icon: Calendar, href: "/hr/leave" },
                { label: "Payroll", icon: Banknote, href: "/hr/payroll", exact: true },
                { label: "Payroll Analytics", icon: PieChart, href: "/hr/payroll/analytics" },
            ],
        },
        {
            label: "Compliance",
            routes: [
                { label: "Compliance Report", icon: ClipboardCheck, href: "/compliance" },
            ],
        },
        {
            label: "Security",
            routes: [
                { label: "Overview", icon: ShieldCheck, href: "/security" },
                { label: "Checkpoints", icon: ScanLine, href: "/security/checkpoints" },
                { label: "Patrols", icon: ClipboardList, href: "/security/patrols" },
                { label: "Incidents", icon: AlertTriangle, href: "/security/incidents" },
                { label: "Security Settings", icon: Settings, href: "/security/settings" },
            ],
        },
        {
            label: "Settings",
            routes: [
                { label: "Global Settings", icon: Settings, href: "/settings" },
            ],
        },
    ];

    const sidebarContent = (
        <div
            className="flex flex-col h-full text-white w-64 border-r border-white/10"
            style={{
                backgroundColor: brandColor ? `${brandColor}dd` : "#0f172abb",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}
        >
            <div className="px-3 py-2 flex-1 overflow-y-auto">
                {/* Logo / org name */}
                <div className="flex items-center justify-between pl-3 mb-8 pt-2">
                    <Link href={`/dashboard/${orgId}`}>
                        <h1 className="text-2xl font-bold truncate tracking-tight">{orgName}</h1>
                    </Link>
                    {/* Close button — only shows inside the mobile drawer */}
                    <button
                        onClick={close}
                        className="lg:hidden p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {groups.map((group, i) => {
                        if (group.visible === false) return null;
                        return (
                            <div key={group.label || i}>
                                {group.label && group.label !== "General" && group.label !== "Settings" && (
                                    <h4 className="mb-2 px-4 text-xs font-semibold tracking-wider text-white/40 uppercase">
                                        {group.label}
                                    </h4>
                                )}
                                <div className="space-y-1">
                                    {group.routes.map((route) => {
                                        const path = `/dashboard/${orgId}${route.href}`;
                                        const isActive = route.exact
                                            ? pathname === path
                                            : pathname.startsWith(path);
                                        return (
                                            <Link
                                                key={route.href}
                                                href={path}
                                                className={cn(
                                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                                    isActive ? "text-white bg-white/10" : "text-zinc-400"
                                                )}
                                            >
                                                <div className="flex items-center flex-1">
                                                    <route.icon className={cn("h-5 w-5 mr-3", isActive ? "text-white" : "text-zinc-400")} />
                                                    {route.label}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {logoUrl && (
                <div className="p-4 flex justify-center pb-8 opacity-80 hover:opacity-100 transition-opacity mt-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo" className="w-full h-auto object-contain max-h-16" />
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* ── Desktop: always-visible sidebar ─────────────────────── */}
            <div className="hidden lg:flex print:hidden h-screen sticky top-0 flex-shrink-0">
                {sidebarContent}
            </div>

            {/* ── Mobile: slide-over drawer ────────────────────────────── */}
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={close}
                aria-hidden="true"
            />
            {/* Drawer panel */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex-shrink-0 transition-transform duration-300 ease-in-out lg:hidden print:hidden",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {sidebarContent}
            </div>
        </>
    );
}
