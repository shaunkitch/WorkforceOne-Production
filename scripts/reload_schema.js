const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = 'postgres://postgres.eodxgmwyfailgzjksmzs:wx9IDPrEni9WV3jy@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';

async function reloadSchema() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        console.log('Connected to db... reloading schema cache');

        await client.query("NOTIFY pgrst, 'reload schema'");
        console.log('Schema cache reloaded successfully.');

    } catch (err) {
        console.error('Error reloading cache:', err);
    } finally {
        await client.end();
    }
}

reloadSchema();
