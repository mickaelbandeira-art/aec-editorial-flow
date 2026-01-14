
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fvakqoufkkgdtezedfwy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YWtxb3Vma2tnZHRlemVkZnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODg3MDYsImV4cCI6MjA4MTU2NDcwNn0.lBtX4Yw4l9RvDqcl6ppnxPCNlzXFYEj_UJUm2mp27aE";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function verifyConnection() {
    console.log("Testing Supabase connection...");
    try {
        const { data, error } = await supabase.from('flowrev_produtos').select('count', { count: 'exact', head: true });

        if (error) {
            console.error("Connection Failed:", error.message);
            process.exit(1);
        } else {
            console.log("Connection Successful!");
            console.log("Status: 200 OK");
            console.log("Successfully connected to project:", SUPABASE_URL);
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        process.exit(1);
    }
}

verifyConnection();
