import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "lucide-react";

const INSUMO_TYPES = [
    "Sumário",
    "Princípios Inegociáveis AeC",
    "Editorial",
    "Nossa Estrutura",
    "Destaques (Instrutor / Alunos)",
    "Mapa de Calor",
    "Big Numbers (Pesquisas)",
    "Ações",
    "Tela em Contexto",
    "Semana do Instrutor",
    "Black Friday",
    "Recomeçar",
    "Galera do Elogio",
    "Promovidos",
    "Informativos",
    "Curiosidades",
    "Jogo"
];

export function SeedInsumosBtn() {
    const handleSeed = async () => {
        try {
            toast.info("Iniciando seed de tipos de insumo...");

            // 1. Get existing types
            const { data: existing, error: fetchError } = await supabase
                .from('flowrev_tipos_insumos')
                .select('nome');

            if (fetchError) throw fetchError;

            const existingNames = new Set(existing?.map(e => e.nome));
            const newTypes = INSUMO_TYPES.filter(t => !existingNames.has(t));

            if (newTypes.length === 0) {
                toast.info("Todos os tipos de insumo já existem.");
                return;
            }

            // 2. Insert new types
            const toInsert = newTypes.map((nome, index) => ({
                nome,
                slug: nome.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanum with dash
                    .replace(/^-+|-+$/g, ''), // remove leading/trailing dashes
                descricao: `Insumo do tipo ${nome}`,
                ordem: (existing?.length || 0) + index + 1,
                requer_imagem: true, // Default to true as per requirements usually implies media
                requer_legenda: true,
                requer_pdf: true,
                ativo: true
            }));

            const { error: insertError } = await supabase
                .from('flowrev_tipos_insumos')
                .insert(toInsert);

            if (insertError) throw insertError;

            toast.success(`${newTypes.length} tipos de insumo criados com sucesso!`);
        } catch (error) {
            console.error("Erro ao seedar insumos:", error);
            toast.error("Erro ao criar tipos de insumo. Verifique o console.");
        }
    };

    return (
        <Button onClick={handleSeed} variant="outline" size="sm" className="gap-2">
            <Database className="w-4 h-4" />
            Seed Insumos
        </Button>
    );
}
