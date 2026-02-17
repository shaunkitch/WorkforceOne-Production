import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardRootPage() {
  const supabase = createClient();

  // Get authenticated user (secure)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error("DashboardRootPage Auth Error:", authError);
    // Don't redirect immediately to avoid loops if it's a network error
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Connection Error</h1>
        <p className="text-muted-foreground">Could not verify session with Supabase.</p>
        <pre className="bg-muted p-4 rounded text-xs">{JSON.stringify(authError, null, 2)}</pre>
        <form action={async () => {
          "use server"
          const { cookies } = require("next/headers")
          cookies().delete("sb-access-token")
          cookies().delete("sb-refresh-token")
          redirect("/login")
        }}>
           <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
             Clear Session & Login
           </button>
        </form>
      </div>
    );
  }

  // Fetch organization data with error handling
  let organizationMember = null;
  try {
    const { data, error } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    
    if (error) {
      // PGRST116 means no rows returned from .single(), which is expected for new users
      if (error.code !== 'PGRST116') {
        console.error("Error fetching organization:", error);
      }
    } else {
      organizationMember = data;
    }
  } catch (err) {
    console.error("Error fetching organization catch block:", err);
  }

  if (!organizationMember) {
    // User has no organization; redirect to onboarding
    redirect("/onboarding");
  }

  redirect(`/dashboard/${organizationMember.organization_id}`);
}
