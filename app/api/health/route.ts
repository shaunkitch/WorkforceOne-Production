import { getSystemHealth } from "@/lib/monitoring";
import { NextResponse } from "next/server";

export async function GET() {
    const health = await getSystemHealth();

    const status = health.database.status === 'connected' ? 200 : 503;

    return NextResponse.json(health, { status });
}
