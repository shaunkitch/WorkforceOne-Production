import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FormBuilder from "@/components/forms/builder/FormBuilder";

export default async function FormEditorPage({ params }: { params: { orgId: string, formId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: form } = await supabase
        .from("forms")
        .select("*")
        .eq("id", params.formId)
        .single();

    if (!form) {
        redirect(`/dashboard/${params.orgId}/forms`);
    }

    return <FormBuilder form={form} />;
}
