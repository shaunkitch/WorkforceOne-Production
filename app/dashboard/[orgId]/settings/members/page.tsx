import { getOrganizationMembers, inviteMember } from "@/lib/actions/users";
import { MembersListClient } from "./members-client";
import { Suspense } from "react";

export default async function MembersPage({ params }: { params: { orgId: string } }) {
    const members = await getOrganizationMembers(params.orgId);

    return (
        <Suspense fallback={<div>Loading members...</div>}>
            <MembersListClient members={members} orgId={params.orgId} />
        </Suspense>
    );
}
