import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fvakqoufkkgdtezedfwy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YWtxb3Vma2tnZHRlemVkZnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODg3MDYsImV4cCI6MjA4MTU2NDcwNn0.lBtX4Yw4l9RvDqcl6ppnxPCNlzXFYEj_UJUm2mp27aE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedRH() {
    console.log("Checking for 'rh' product...");

    // 1. Check if exists
    const { data: existing, error: fetchError } = await supabase
        .from('flowrev_produtos')
        .select('*')
        .eq('slug', 'rh')
        .maybeSingle();

    if (fetchError) {
        console.error("Error fetching product:", fetchError);
        return;
    }

    if (existing) {
        console.log("Product 'RH' already exists:", existing);
        return;
    }

    // 2. Get max order
    const { data: products, error: listError } = await supabase
        .from('flowrev_produtos')
        .select('ordem')
        .order('ordem', { ascending: false })
        .limit(1);

    if (listError) {
        console.error("Error fetching max order:", listError);
        return;
    }

    const maxOrder = products && products.length > 0 ? products[0].ordem : 0;
    const newOrder = maxOrder + 1;

    console.log(`Creating 'RH' product with order ${newOrder}...`);

    // 3. Insert
    const { data: newProduct, error: insertError } = await supabase
        .from('flowrev_produtos')
        .insert({
            nome: "RH",
            slug: "rh",
            cor_tema: "#8b5cf6", // Purple
            ativo: true,
            ordem: newOrder,
            logo_url: null
        })
        .select()
        .single();

    if (insertError) {
        console.error("Error inserting product:", insertError);
    } else {
        console.log("Successfully created product:", newProduct);
    }
}

seedRH();
