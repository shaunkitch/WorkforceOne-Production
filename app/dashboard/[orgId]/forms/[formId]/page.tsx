import { getFormStats } from "@/lib/actions/forms/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, MousePointerClick, View } from "lucide-react";
import Link from "next/link";

export default async function FormOverviewPage({
    params,
}: {
    params: { orgId: string; formId: string };
}) {
    const stats = await getFormStats(params.formId);

    return (
        <div className="w-full pt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Visits"
                    icon={<View className="text-blue-600" />}
                    helperText="Total visits to your form"
                    value={stats.visits > 0 ? stats.visits.toString() : "-"}
                    loading={false}
                    className="shadow-md shadow-blue-600"
                />
                <Link href={`/dashboard/${params.orgId}/forms/${params.formId}/submissions`} className="block transition-transform hover:scale-105">
                    <StatsCard
                        title="Total Submissions"
                        icon={<Activity className="text-yellow-600" />}
                        helperText="Total form submissions"
                        value={stats.submissions.toString()}
                        loading={false}
                        className="shadow-md shadow-yellow-600 h-full cursor-pointer"
                    />
                </Link>
                <StatsCard
                    title="Submission Rate"
                    icon={<MousePointerClick className="text-green-600" />}
                    helperText="Visits that result in submission"
                    value={stats.rate.toString() + "%"}
                    loading={false}
                    className="shadow-md shadow-green-600"
                />
            </div>
        </div>
    );
}

function StatsCard({
    title,
    value,
    icon,
    helperText,
    loading,
    className,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    helperText: string;
    loading: boolean;
    className: string;
}) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {loading && (
                        <span className="opacity-0">0</span>
                    )}
                    {!loading && value}
                </div>
                <p className="text-xs text-muted-foreground pt-1">{helperText}</p>
            </CardContent>
        </Card>
    );
}
