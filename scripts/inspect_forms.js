
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let env = {};
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [k, v] = line.split('=');
        if (k && v) env[k.trim()] = v.trim().replace(/"/g, '');
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkForms() {
    const { data: forms, error } = await supabase.from('forms').select('id, title, content');

    if (error) {
        console.error('Error fetching forms:', error);
        return;
    }

    console.log(`Found ${forms.length} forms.`);

    forms.forEach(form => {
        console.log(`\nForm: ${form.title} (${form.id})`);
        if (Array.isArray(form.content)) {
            const types = form.content.map(el => el.type);
            console.log('Element Types:', types.join(', '));
        } else {
            console.log('Content is not an array:', form.content);
        }
    });
}

checkForms();
