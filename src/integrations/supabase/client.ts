import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 1. CORREÇÃO: Usamos import.meta.env em vez de process.env
// O prefixo VITE_ é obrigatório para o Vite expor estas chaves ao navegador
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// 2. VALIDAÇÃO: Evita que a aplicação quebre se as chaves faltarem
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Erro de Configuração: VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY não foram encontradas. " +
    "Verifique as Variáveis de Ambiente na Vercel ou no ficheiro .env."
  );
}

// 3. INICIALIZAÇÃO: Criamos o cliente de forma segura
// Usamos || "" para garantir que o createClient recebe uma string, mesmo que vazia, 
// evitando o erro fatal de "required" que causa a tela branca.
export const supabase = createClient<Database>(
  supabaseUrl || "",
  supabaseAnonKey || ""
);