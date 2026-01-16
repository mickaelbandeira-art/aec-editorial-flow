import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, Loader2 } from "lucide-react";
import { useState } from "react";

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

const PRODUCTS = [
    { nome: "Claro", slug: "claro", cor: "#ef3829" },
    { nome: "iFood", slug: "ifood", cor: "#ea1d2c" },
    { nome: "iFood Pago", slug: "ifood-pago", cor: "#ea1d2c" },
    { nome: "Ton", slug: "ton", cor: "#00c868" },
    { nome: "Inter", slug: "inter", cor: "#ff7a00" },
    { nome: "Fábrica de Conteúdos", slug: "fabrica", cor: "#1a1a1a" }
];

export function SeedInsumosBtn() {
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        try {
            // --- SEED PRODUCTS ---
            const { data: existingProducts, error: prodFetchError } = await supabase
                .from('flowrev_produtos')
                .select('slug');

            if (prodFetchError) throw new Error(`Erro ao buscar produtos: ${prodFetchError.message}`);

            const existingProdSlugs = new Set(existingProducts?.map(p => p.slug));
            const newProducts = PRODUCTS.filter(p => !existingProdSlugs.has(p.slug));

            if (newProducts.length > 0) {
                const { error: prodInsertError } = await supabase
                    .from('flowrev_produtos')
                    .insert(newProducts.map((p, i) => ({
                        nome: p.nome,
                        slug: p.slug,
                        cor_tema: p.cor,
                        ativo: true,
                        ordem: (existingProducts?.length || 0) + i + 1,
                        logo_url: null // Logos are imported in frontend, database just needs existence
                    })));

                if (prodInsertError) throw new Error(`Erro ao criar produtos: ${prodInsertError.message}`);
                toast.success(`${newProducts.length} produtos criados!`);
            } else {
                toast.info("Produtos já existem.");
            }

            // --- SEED INSUMO TYPES ---
            const { data: existingInsumos, error: insFetchError } = await supabase
                .from('flowrev_tipos_insumos')
                .select('nome');

            if (insFetchError) throw new Error(`Erro ao buscar tipos de insumo: ${insFetchError.message}`);

            const existingNames = new Set(existingInsumos?.map(e => e.nome));
            const newTypes = INSUMO_TYPES.filter(t => !existingNames.has(t));

            if (newTypes.length > 0) {
                const toInsert = newTypes.map((nome, index) => ({
                    nome,
                    slug: nome.toLowerCase()
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, ''),
                    descricao: `Insumo do tipo ${nome}`,
                    ordem: (existingInsumos?.length || 0) + index + 1,
                    requer_imagem: true,
                    requer_legenda: true,
                    requer_pdf: true,
                    ativo: true
                }));

                const { error: insertError } = await supabase
                    .from('flowrev_tipos_insumos')
                    .insert(toInsert);

                if (insertError) throw new Error(`Erro ao criar tipos de insumo: ${insertError.message}`);

                toast.success(`${newTypes.length} tipos de insumo criados!`);
            } else {
                toast.info("Tipos de insumo já existem.");
            }

            // --- SEED USERS ---
            const USERS_TO_SEED = [
                { email: "gracyelle.azarias@aec.com.br", nome: "Gracyelle Azarias", role: "analista", matricula: "90001" },
                { email: "a.mariana.veras@aec.com.br", nome: "Mariana Veras", role: "supervisor", matricula: "90002" },
                { email: "silvia.silvia@aec.com.br", nome: "Silvia", role: "supervisor", matricula: "368774" },
                { email: "a.yara.ssilva@aec.com.br", nome: "Yara Silva", role: "analista_pleno", matricula: "90003" },
                { email: "jonathan.silva@aec.com.br", nome: "Jonathan Silva", role: "gerente", matricula: "90004" },
                { email: "a.izaura.bezerra@aec.com.br", nome: "Izaura Bezerra", role: "coordenador", matricula: "90005" }
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: userError } = await (supabase as any)
                .from('flowrev_users')
                .upsert(USERS_TO_SEED.map(u => ({
                    email: u.email,
                    nome: u.nome,
                    role: u.role,
                    matricula: u.matricula,
                    produtos_acesso: ["fabrica"],
                    active: true
                })), { onConflict: 'email' });

            if (userError) throw new Error(`Erro ao criar usuários: ${userError.message}`);
            toast.success("5 Usuários de Fábrica criados/atualizados!");

        } catch (error) {
            console.error("Erro no seed:", error);
            const msg = error instanceof Error ? error.message : "Erro desconhecido ao seedar dados";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleSeed} variant="outline" size="sm" className="gap-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Seed Dados (Produtos & Insumos)
        </Button>
    );
}
