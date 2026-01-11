"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAutomations(formId: string) {
    const supabase = createClient();
    const { data } = await supabase
        .from("automations")
        .select("*")
        .eq("form_id", formId)
        .order("created_at", { ascending: false });

    return data || [];
}

export async function executeAutomations(automations: any[], submission: any) {
    // 3. Evaluate and Action
    const { sendGenericEmail } = await import("@/lib/mail");

    for (const auto of automations) {
        // Condition Check (Simplified: If empty, always true)
        const conditions = auto.conditions as any[];
        let match = true;
        if (conditions && conditions.length > 0) {
            match = true; // Default true, AND logic

            for (const condition of conditions) {
                const { fieldId, operator, value } = condition;
                const submissionValue = submission.data[fieldId];

                // Safety check: if field is missing in submission, it doesn't match
                if (submissionValue === undefined || submissionValue === null) {
                    match = false;
                    break;
                }

                const strSubValue = String(submissionValue).toLowerCase();
                const strTargetValue = String(value).toLowerCase();

                switch (operator) {
                    case 'equals':
                        if (strSubValue !== strTargetValue) match = false;
                        break;
                    case 'not_equals':
                        if (strSubValue === strTargetValue) match = false;
                        break;
                    case 'contains':
                        if (!strSubValue.includes(strTargetValue)) match = false;
                        break;
                    // Add more operators as needed (gt, lt, etc.)
                    default:
                        // Unknown operator, ignore or fail? Let's ignore this condition (treated as true) or match=false
                        // Safety: fail.
                        match = false;
                }

                if (!match) break; // Short-circuit
            }
        }

        if (match) {
            // Execute Actions
            const actions = auto.actions as any[];
            for (const action of actions) {
                if (action.type === 'email') {
                    try {
                        await sendGenericEmail(action.to, action.subject, action.body);
                        console.log(`Executed Automation ${auto.name}: Sent email to ${action.to}`);
                    } catch (err) {
                        console.error(`Failed to execute automation ${auto.name}`, err);
                    }
                }
            }
        }
    }
}

export async function createAutomation(formId: string, orgId: string, data: {
    name: string;
    conditions: any[];
    actions: any[];
}) {
    const supabase = createClient();

    // Validate permission (already handled by RLS but good to check role if needed)

    const { error } = await supabase.from("automations").insert({
        form_id: formId,
        name: data.name,
        conditions: data.conditions, // JSONB
        actions: data.actions // JSONB
    });

    if (error) throw error;

    revalidatePath(`/dashboard/${orgId}/forms/${formId}/automations`);
}

export async function deleteAutomation(automationId: string, formId: string, orgId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from("automations")
        .delete()
        .eq("id", automationId);

    if (error) throw error;

    revalidatePath(`/dashboard/${orgId}/forms/${formId}/automations`);
}
