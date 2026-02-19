import { getOrganization, getOrganizationUsage } from "@/lib/actions/organizations";
import SettingsClient from "./settings-client";
import { Suspense } from "react";

export default async function OrganizationSettingsPage({ params }: { params: { orgId: string } }) {
    const [org, usage] = await Promise.all([
        getOrganization(params.orgId),
        getOrganizationUsage(params.orgId)
    ]);

    return (
        <Suspense fallback={<div>Loading settings...</div>}>
            <SettingsClient orgId={params.orgId} org={org} usage={usage} />
        </Suspense>
    );
}
