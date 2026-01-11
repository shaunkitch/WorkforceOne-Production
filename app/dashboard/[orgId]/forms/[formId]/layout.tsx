import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getForm(formId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("forms").select("id, title, organization_id").eq("id", formId).single();
    return data;
}

export default async function FormDetailsLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { orgId: string; formId: string };
}) {
    const form = await getForm(params.formId);

    if (!form) {
        return notFound();
    }

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex justify-between w-full items-center border-b pb-4">
                <h1 className="text-4xl font-bold truncate">{form.title}</h1>
                <Button asChild>
                    <Link href={`/submit/${form.id}`} target="_blank">
                        Visit Public Link
                    </Link>
                </Button>
            </div>
            <div className="w-full border-b">
                <nav className="flex gap-4">
                    <Link
                        href={`/dashboard/${params.orgId}/forms/${params.formId}`}
                        className="pb-2 border-b-2 border-transparent hover:border-muted-foreground transition-colors"
                    >
                        Overview
                    </Link>
                    <Link
                        href={`/dashboard/${params.orgId}/forms/${params.formId}/submissions`}
                        className="pb-2 border-b-2 border-transparent hover:border-muted-foreground transition-colors"
                    >
                        Submissions
                    </Link>
                    <Link
                        href={`/dashboard/${params.orgId}/forms/${params.formId}/assignments`}
                        className="pb-2 border-b-2 border-transparent hover:border-muted-foreground transition-colors"
                    >
                        Assignments
                    </Link>
                    <Link
                        href={`/dashboard/${params.orgId}/forms/${params.formId}/analytics`}
                        className="pb-2 border-b-2 border-transparent hover:border-muted-foreground transition-colors"
                    >
                        Analytics
                    </Link>
                    <Link
                        href={`/dashboard/${params.orgId}/forms/${params.formId}/automations`}
                        className="pb-2 border-b-2 border-transparent hover:border-muted-foreground transition-colors"
                    >
                        Automations
                    </Link>
                    <Link
                        href={`/dashboard/${params.orgId}/forms/${params.formId}/settings`}
                        className="pb-2 border-b-2 border-transparent hover:border-muted-foreground transition-colors"
                    >
                        Settings
                    </Link>
                </nav>
            </div>
            {children}
        </div>
    );
}
