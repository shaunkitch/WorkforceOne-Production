import { getForm } from "@/lib/actions/forms";
import FormBuilder from "@/components/forms/builder/FormBuilder";
import { redirect } from "next/navigation";

interface BuilderPageProps {
    params: {
        orgId: string;
        formId: string;
    };
}

export default async function BuilderPage({ params }: BuilderPageProps) {
    const { orgId, formId } = params;

    const form = await getForm(formId);

    if (!form) {
        redirect(`/dashboard/${orgId}/forms`);
    }

    return <FormBuilder form={form} />;
}
