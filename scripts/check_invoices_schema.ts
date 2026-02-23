import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const { data, error } = await supabase
        .from('invoices')
        .select('id')
        .limit(1);
    
    if (error) {
        console.log("Invoices table error:", error.message);
    } else {
        console.log("Invoices table exists.");
    }

    const { data: qData, error: qError } = await supabase
        .from('quotes')
        .select('id')
        .limit(1);
    
    if (qError) {
        console.log("Quotes table error:", qError.message);
    } else {
        console.log("Quotes table exists.");
    }
}

checkTables();
