import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fvakqoufkkgdtezedfwy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2YWtxb3Vma2tnZHRlemVkZnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODg3MDYsImV4cCI6MjA4MTU2NDcwNn0.lBtX4Yw4l9RvDqcl6ppnxPCNlzXFYEj_UJUm2mp27aE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const USERS_TO_SEED = [
    { email: "maria.clfranca@aec.com.br", nome: "Maria Clara Franca da Silva", role: "analista", matricula: "452015", produtos: ["ifood-pago", "inter", "ton", "qualidade"] },
    { email: "a.mariana.veras@aec.com.br", nome: "Mariana Veras", role: "supervisor", matricula: "90002", produtos: ["ifood"] },
    { email: "silvia.silvia@aec.com.br", nome: "Silvia", role: "supervisor", matricula: "368774", produtos: ["claro"] },
    { email: "a.yara.ssilva@aec.com.br", nome: "Yara Benedita dos Santos Silva", role: "analista_pleno", matricula: "262756", produtos: ["fabrica"] },
    // Updated Admins
    { email: "jonathan.silva@aec.com.br", nome: "Jonathan Silva", role: "gerente", matricula: "90004", produtos: ["fabrica", "claro", "ifood", "ifood-pago", "ton", "inter", "rh"] },
    { email: "a.izaura.bezerra@aec.com.br", nome: "Izaura Bezerra", role: "coordenador", matricula: "90005", produtos: ["fabrica", "rh"] },
    // New Users for RH
    { email: "mickael.bandeira@aec.com.br", nome: "Mickael Bandeira da Silva", role: "analista", matricula: "461576", produtos: ["claro", "rh", "ton"] },
    { email: "arakem.rocha@aec.com.br", nome: "Arakem Alves Rocha", role: "analista", matricula: "135447", produtos: ["rh"] },
    { email: "neliane.olimpio@aec.com.br", nome: "Neliane Alves Olimpio", role: "analista", matricula: "309582", produtos: ["rh"] },
    { email: "milena.santos@aec.com.br", nome: "Milena Carla Costa dos Santos", role: "supervisor", matricula: "134056", produtos: ["rh"] },
    { email: "adrisa.alves@aec.com.br", nome: "Adrisa Alves dos Santos", role: "supervisor", matricula: "251016", produtos: ["rh"] }
];

async function seedUsers() {
    console.log("Seeding users...");

    const { error: userError } = await supabase
        .from('flowrev_users')
        .upsert(USERS_TO_SEED.map(u => ({
            email: u.email,
            nome: u.nome,
            role: u.role,
            matricula: u.matricula,
            produtos_acesso: u.produtos
        })), { onConflict: 'email' });

    if (userError) {
        console.error("Error seeding users:", userError);
    } else {
        console.log("Successfully seeded/updated users!");
    }
}

seedUsers();
