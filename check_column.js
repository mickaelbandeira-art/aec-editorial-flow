
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltam variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn() {
  console.log("Verificando se a coluna 'deleted_at' existe em 'flowrev_insumos'...");
  
  const { data, error } = await supabase
    .from('flowrev_insumos')
    .select('deleted_at')
    .limit(1);

  if (error) {
    if (error.code === '42703') {
      console.error("❌ ERRO: A coluna 'deleted_at' NÃO EXISTE na tabela 'flowrev_insumos'.");
      console.log("Por favor, execute a migração SQL em 'supabase/migrations/20260319000000_add_deleted_at_to_insumos.sql' no seu SQL Editor do Supabase.");
    } else {
      console.error("❌ Erro ao consultar tabela:", error.message);
    }
  } else {
    console.log("✅ Sucesso: A coluna 'deleted_at' existe.");
  }
}

checkColumn();
