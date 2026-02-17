
const { createClient } = require('@supabase/supabase-js');

// Hardcoded creds from .env.local
const SUPABASE_URL = "https://eodxgmwyfailgzjksmzs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZHhnbXd5ZmFpbGd6amtzbXpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc4MTM4NywiZXhwIjoyMDgzMzU3Mzg3fQ.l2HNiVt8JLWqJxh240QGqrx9VOxF7xxELXf7Tn050-M"; // Service Role Key for full access debug

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkPayroll() {
    const runId = 'e4bdae8f-f027-4f70-8855-4e0485b67ac8';

    console.log(`Checking run: ${runId}`);

    const { data: run, error: runError } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('id', runId)
        .single();

    if (runError) {
        console.error('Error fetching run:', runError);
        return;
    }
    console.log('Run found:', run);

    const { data: items, error: itemsError } = await supabase
        .from('payroll_items')
        .select('*')
        .eq('payroll_run_id', runId);

    if (itemsError) {
        console.error('Error fetching items:', itemsError);
    } else {
        console.log(`Found ${items.length} items`);
    }

    if (!items || items.length === 0) {
        console.log('Checking for potential items based on time entries...');
        console.log(`Period: ${run.period_start} to ${run.period_end}`);
        console.log(`Org: ${run.organization_id}`);

        const { data: entries, error: entriesError } = await supabase
            .from('time_entries')
            .select('*')
            .eq('organization_id', run.organization_id)
            .gte('clock_in', run.period_start)
            .lte('clock_out', run.period_end);

        if (entriesError) console.error(entriesError);
        else {
            console.log(`Found ${entries.length} time entries in this period.`);
            if (entries.length > 0) {
                console.log("Sample Entry:", entries[0]);
            }
        }

        // Check members
        const { data: members, error: membersError } = await supabase
            .from("organization_members")
            .select("user_id, profiles(id, hourly_rate)")
            .eq("organization_id", run.organization_id);

        if (membersError) console.error(membersError);
        else {
            console.log(`Found ${members.length} members`);
            if (members.length > 0) console.log("Sample Member:", JSON.stringify(members[0], null, 2));
        }
    }
}

checkPayroll();
