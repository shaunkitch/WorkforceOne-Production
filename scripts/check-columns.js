
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple .env parser
function parseEnv(path) {
    const content = fs.readFileSync(path, 'utf8');
    const config = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            config[key] = value;
        }
    });
    return config;
}

const envConfig = parseEnv('.env.local');

const supabase = createClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
    console.log("Checking organization_members columns...");

    const { data: orgData, error: orgError } = await supabase
        .from('organization_members')
        .select('employee_number') // Try to select the specific column
        .limit(1);

    if (orgError) {
        console.error("Error checking employee_number:", orgError);
    } else {
        console.log("Success! employee_number column exists.");
    }

    console.log("Checking profiles columns...");
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('bank_details')
        .limit(1);

    if (profilesError) {
        console.error("Error checking bank_details:", profilesError);
    } else {
        console.log("Success! bank_details column exists.");
    }
}

checkSchema();
