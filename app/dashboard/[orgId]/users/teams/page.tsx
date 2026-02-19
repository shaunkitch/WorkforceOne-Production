import { getTeams } from "@/lib/actions/workforce";
import TeamsListClient from "./teams-client";
import { Suspense } from "react";

export default async function TeamsPage({ params }: { params: { orgId: string } }) {
    const teams = await getTeams(params.orgId);

    return (
        <Suspense fallback={<div>Loading teams...</div>}>
            <TeamsListClient teams={teams} orgId={params.orgId} />
        </Suspense>
    );
}
