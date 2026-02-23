const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = 'postgres://postgres.eodxgmwyfailgzjksmzs:wx9IDPrEni9WV3jy@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';

async function applyMigration() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        console.log('Connected to db... executing fixes');

        const sqlPath1 = path.join(__dirname, '../supabase/migrations/20260224010000_add_task_team_assignment.sql');
        const sql1 = fs.readFileSync(sqlPath1, 'utf8');
        await client.query(sql1);
        console.log('Tasks teams update applied.');

        const sqlPath2 = path.join(__dirname, '../supabase/migrations/20260224020000_fix_org_members_fk.sql');
        const sql2 = fs.readFileSync(sqlPath2, 'utf8');
        await client.query(sql2);
        console.log('Org members FK fix applied.');

    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        await client.end();
    }
}

applyMigration();
