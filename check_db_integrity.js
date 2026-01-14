
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fvakqoufkkgdtezedfwy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YWtxb3Vma2tnZHRlemVkZnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODg3MDYsImV4cCI6MjA4MTU2NDcwNn0.lBtX4Yw4l9RvDqcl6ppnxPCNlzXFYEj_UJUm2mp27aE";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const TABLES_TO_CHECK = [
    'flowrev_produtos',
    'flowrev_edicoes',
    'flowrev_tipos_insumos',
    'flowrev_insumos',
    'flowrev_anexos',
    'flowrev_historico',
    'flowrev_users'
];

async function checkTables() {
    console.log("----------------------------------------");
    console.log("Starting Database Integrity Check...");
    console.log("----------------------------------------\n");

    let allPassed = true;

    for (const table of TABLES_TO_CHECK) {
        process.stdout.write(`Checking table '${table}'... `);
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log("❌ FAILED");
                console.error(`   Error: ${error.message} (${error.code})`);
                if (error.code === '42P01') {
                    console.error("   Reason: Table does not exist.");
                } else if (error.code === '42501') {
                    console.error("   Reason: RLS Policy violation (Permission denied).");
                }
                allPassed = false;
            } else {
                console.log(`✅ OK (Rows: ${count})`);
            }
        } catch (err) {
            console.log("❌ CRITICAL ERROR");
            console.error(`   Unexpected error: ${err.message}`);
            allPassed = false;
        }
    }

    console.log("\n----------------------------------------");
    if (allPassed) {
        console.log("✅ ALL TABLES CHECKED SUCCESSFULLY.");
        console.log("The database schema appears to be in conformity with the project expectations.");
    } else {
        console.log("⚠️ SOME CHECKS FAILED.");
        console.log("Please review the errors above and apply necessary fixes (e.g., running SQL scripts).");
        process.exit(1);
    }
}

checkTables();
