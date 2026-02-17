
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

function loadEnv() {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim().replace(/^["'](.*)["']$/, '$1');
            }
        });
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use Service Role Key if available, otherwise Anon (which failed)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSites() {
    console.log('Checking sites with key starting ' + supabaseKey.substring(0, 5) + '...');
    const { data: sites, error } = await supabase.from('sites').select('*');

    if (error) {
        console.error('Error fetching sites:', error);
        return;
    }

    console.log(`Found ${sites.length} sites:`);
    sites.forEach(site => {
        console.log(`- ${site.name}: Lat=${site.latitude}, Long=${site.longitude}, Radius=${site.radius}`);
    });
}

checkSites();
