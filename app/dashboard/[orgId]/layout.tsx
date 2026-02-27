import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import PageTransition from "@/components/PageTransition";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { hexToHSL } from "@/lib/utils";

type Props = { params: { orgId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  let org: { name?: string; favicon_url?: string } | null = null;
  try {
    const { data } = await supabase
      .from("organizations")
      .select("name, favicon_url")
      .eq("id", params.orgId)
      .single();
    org = data as any;
  } catch (error) {
    console.error("Metadata Fetch Error:", error);
  }
  return {
    title: org?.name ? `${org.name} - WorkforceOne` : "WorkforceOne",
    icons: org?.favicon_url ? [{ rel: "icon", url: org.favicon_url }] : [],
  };
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  const supabase = createClient();
  let user = null;
  try {
    const { data } = await supabase.auth.getSession();
    user = data.session?.user;
  } catch (error) {
    console.error("DashboardLayout Auth Error:", error);
  }

  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("organization_members")
    .select("role, organizations(name, slug, brand_color, logo_url, features)")
    .eq("organization_id", params.orgId)
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/dashboard");

  const org = ((member as any)?.organizations) as { name?: string; brand_color?: string; logo_url?: string; features?: any } | null;
  const orgName = org?.name || "Organization";
  const brandColor = org?.brand_color;
  const logoUrl = org?.logo_url;
  const features = org?.features || {};
  const primaryHSL = brandColor ? hexToHSL(brandColor) : null;

  return (
    <SidebarProvider>
      <div
        className="flex h-screen overflow-hidden bg-background print:block print:h-auto print:overflow-visible"
        style={primaryHSL ? { "--primary": primaryHSL } as React.CSSProperties : undefined}
      >
        {/* Sidebar: sticky on desktop, fixed slide-over drawer on mobile */}
        <Sidebar
          orgId={params.orgId}
          brandColor={brandColor}
          logoUrl={logoUrl}
          orgName={orgName}
          features={features}
        />

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden print:overflow-visible print:h-auto min-w-0">
          <div className="print:hidden">
            <Header user={user} orgName={orgName} />
          </div>
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 print:p-0 print:overflow-visible print:h-auto">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
