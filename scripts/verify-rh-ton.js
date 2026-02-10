import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fvakqoufkkgdtezedfwy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YWtxb3Vma2tnZHRlemVkZnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODg3MDYsImV4cCI6MjA4MTU2NDcwNn0.lBtX4Yw4l9RvDqcl6ppnxPCNlzXFYEj_UJUm2mp27aE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verify() {
    console.log("Verifying 'RH' and 'TON' product access for mickael.bandeira@aec.com.br...");

    const { data: user, error } = await supabase
        .from('flowrev_users')
        .select('*')
        .eq('email', 'mickael.bandeira@aec.com.br')
        .single();

    if (error) {
        console.error("Error fetching user:", error);
    } else {
        console.log("User found:", user.nome);
        console.log("Access Products:", user.produtos_acesso);
        if (user.produtos_acesso.includes('rh') && user.produtos_acesso.includes('ton')) {
            console.log("SUCCESS: User has access to 'rh' and 'ton'.");
        } else {
            console.error("FAILURE: User missing 'rh' or 'ton' access.");
        }
    }
}

verify();
