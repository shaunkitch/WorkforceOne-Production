
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        process.env[match[1].trim()] = value;
    }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

console.log(`Connecting to ${supabaseUrl}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('forms').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Connection Successful!');
            console.log('Forms count:', data);
        }

        // Also test auth endpoint access
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error('Auth Error:', authError);
        } else {
            console.log('Auth Service Accessible');
        }

    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testConnection();
