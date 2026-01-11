import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { FileText, MousePointerClick, View } from "lucide-react";

export default async function DashboardOverview({ params }: { params: { orgId: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Here's what's happening in your workspace.
        </p>
      </div>
      <Separator />

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards orgId={params.orgId} />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <MyAssignments />
          </Suspense>
        </div>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-10">
              No recent activity.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { getUserAssignments } from "@/lib/actions/assignments";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

async function MyAssignments() {
  const assignments = await getUserAssignments();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          My Assignments
        </CardTitle>
        <CardDescription>Forms assigned to you for completion.</CardDescription>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            You have no pending assignments.
          </div>
        )}
        <div className="space-y-4">
          {assignments.map((assignment: any) => (
            <div key={assignment.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
              <div>
                <p className="font-medium">{assignment.forms?.title || "Untitled Form"}</p>
                <p className="text-xs text-muted-foreground">
                  Assigned {formatDistance(new Date(assignment.created_at), new Date(), { addSuffix: true })}
                </p>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <Link href={`/submit/${assignment.form_id}`} target="_blank">
                  Start <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function StatsCards({ orgId }: { orgId: string }) {
  const supabase = createClient();

  // Fetch stats concurrently
  const [
    { count: formsCount },
    { count: submissionsCount }
  ] = await Promise.all([
    supabase
      .from("forms")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      // Use the 'exists' logic or join if RLS allows, but for count we might need a direct query or rpc if policies restrict.
      // However, the policy "Members can view submissions of their organization's forms" uses EXISTS. 
      // COUNTing on the table directly with that policy might be slow or tricky if not optimized, but should work.
      // Actually, to filter by organization_id for submissions, we need to join forms.
      // Supabase client filters operate on the table being selected.
      // We can't easily filter submissions by org_id directly without embedding.
      // Let's defer submissions count for now or use a join.
      .not("id", "is", null) // Just a dummy filter to trigger count if we rely on RLS to filter to org.
    // Wait, RLS filters ROWS, but we need to ensure we stick to the current org.
    // If the user belongs to multiple orgs, Select * from submissions might return submissions from ALL orgs they are in.
    // So we MUST filter by form.organization_id.
    // .eq("forms.organization_id", orgId) // This doesn't work directly in standard postgrest without 'select(..., forms!inner(...))'
  ]);

  // Correct approach for submissions count:
  // Since we can't easily count with deep filter in simple head request, let's just count forms for now 
  // and maybe Total Views if we had that.

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formsCount || 0}</div>
          <p className="text-xs text-muted-foreground">
            +0% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">
            Analytics coming soon
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Form Views</CardTitle>
          <View className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">
            Analytics coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
