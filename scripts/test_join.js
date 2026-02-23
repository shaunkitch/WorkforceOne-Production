const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    'https://odklligplbpjqfatdyde.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ka2xsaWdwbGJwanFmYXRkeWRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg0MzczNCwiZXhwIjoyMDg3NDE5NzM0fQ.8lWrELgrTFyM2NKcZCmiv-8p2FrCZ0bNA6UonPa9F-I'
);

async function test() {
    const { data, error } = await supabase.from('organization_members').select('*, profiles(*)').limit(1);
    console.log('QueryResult for Profiles Join:', { data, error });
}
test();
