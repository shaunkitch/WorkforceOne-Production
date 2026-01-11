import FormSubmitComponent from "@/components/forms/FormSubmitComponent";
import { createClient } from "@/lib/supabase/server";
import { FormElementInstance } from "@/types/forms";
import { notFound } from "next/navigation";

export default async function SubmitPage({
    params,
}: {
    params: {
        formUrl: string;
    };
}) {
    const supabase = createClient();
    const { data: form } = await supabase
        .from("forms")
        .select("content, is_published")
        .eq("id", params.formUrl)
        .single();

    if (!form || !form.is_published) {
        // If not published or not found
        return notFound();
    }

    const formContent = form.content as unknown as FormElementInstance[];

    return <FormSubmitComponent formUrl={params.formUrl} content={formContent} />;
}
