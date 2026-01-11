import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardRootPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // TODO: Implement logic to determine the user's primary or default organization
  // For now, we'll try to fetch the first organization they are a member of.
  const { data: organizationMember, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error) {
    // PGRST116 means no rows returned from .single(), which is expected for new users
    if (error.code !== 'PGRST116') {
      console.error("Error fetching organization:", error);
      redirect("/login");
    }
  }

  if (!organizationMember) {
    // User has no organization; redirect to onboarding to create/join one
    redirect("/onboarding");
  }

  redirect(`/dashboard/${organizationMember.organization_id}`);
}
