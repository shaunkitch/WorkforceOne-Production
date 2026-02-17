import { createClient } from "@/lib/supabase/server";

export async function checkDatabaseConnection() {
    const supabase = createClient();
    try {
        const start = performance.now();
        const { error } = await supabase.from("organizations").select("count", { count: 'exact', head: true }).limit(1);
        const end = performance.now();

        if (error) throw error;

        return {
            status: 'connected',
            latency: Math.round(end - start)
        };
    } catch (error: any) {
        console.error("Database Check Error:", error);
        return {
            status: 'error',
            message: error.message,
            latency: 0
        };
    }
}

export async function getSystemHealth() {
    const dbCheck = await checkDatabaseConnection();

    return {
        database: dbCheck,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION || 'dev (local)',
    };
}
