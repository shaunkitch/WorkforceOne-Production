import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify membership (optional but recommended for security/UX)
  // For now, we rely on RLS, but fetching it here helps with displaying Org Name in header.
  const { data: member } = await supabase
    .from("organization_members")
    .select("role, organizations(name, slug, brand_color, logo_url)")
    .eq("organization_id", params.orgId)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    // User is not a member of this org
    redirect("/dashboard"); // Will redirect to their first org or onboarding
  }

  const org = (member.organizations as any); // Type assertion for joined data
  const orgName = org?.name || "Organization";
  const brandColor = org?.brand_color;
  const logoUrl = org?.logo_url;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        orgId={params.orgId}
        brandColor={brandColor}
        logoUrl={logoUrl}
        orgName={orgName}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={user} orgName={orgName} />
        <main className="flex-1 overflow-y-auto p-8">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
