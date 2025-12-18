import { ProductInsumosBoard } from "@/components/flowrev/kanban/ProductInsumosBoard";
import { useDashboardStats } from "@/hooks/useFlowrev";
import { Loader2 } from "lucide-react";
import { Insumo } from "@/types/flowrev";

export default function ProductionLine() {
    // We can use useDashboardStats to get all insumos for the current month across all products
    // Or we could create a dedicated hook useAllInsumos()
    const { data: stats, isLoading } = useDashboardStats();

    // Extract all insumos from the stats query which fetches them to calculate totals
    // But wait, useDashboardStats calculates metrics but doesn't return the raw array easily in the current return shape
    // Let's modify useDashboardStats or just fetch them here?
    // Actually, useDashboardStats returns 'edicoes' and logic inside computes stats. 
    // We need the raw insumos.
    // Let's look at useFlowrev.tsx again. useDashboardStats fetches insumos internally.
    // Let's implementing a specific query here is better/cleaner.
}

// Reseting connection for clean implementation
import { useInsumos } from "@/hooks/useFlowrev"; // This takes ONE edition ID. We need ALL.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Inline hook for "All Insumos of the Month"
function useAllInsumosOfMonth() {
    return useQuery({
        queryKey: ['flowrev-all-insumos-month'],
        queryFn: async () => {
            const now = new Date();
            const mes = now.getMonth() + 1;
            const ano = now.getFullYear();

            // 1. Get editions
            const { data: edicoes, error: edicoesError } = await supabase
                .from('flowrev_edicoes')
                .select('id')
                .eq('mes', mes)
                .eq('ano', ano);

            if (edicoesError) throw edicoesError;
            const edicoesIds = edicoes?.map(e => e.id) || [];

            if (edicoesIds.length === 0) return [];

            // 2. Get insumos
            const { data: insumos, error: insumosError } = await supabase
                .from('flowrev_insumos')
                .select(`
          *,
          tipo_insumo:flowrev_tipos_insumos(*),
          anexos:flowrev_anexos(*),
          edicao:flowrev_edicoes(
            *,
            produto:flowrev_produtos(*)
          )
        `)
                .in('edicao_id', edicoesIds)
                .order('created_at');

            if (insumosError) throw insumosError;
            return insumos as Insumo[];
        }
    });
}

export default function ProductionLine() {
    const { data: insumos, isLoading } = useAllInsumosOfMonth();

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex-1 w-full h-[calc(100vh-4rem)] p-4 md:p-8 pt-6 overflow-hidden">
                <div className="mb-8 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Esteira de Produção</h2>
                        <p className="text-muted-foreground">
                            Acompanhe o fluxo de produção de conteúdo em tempo real (Todas as Revistas).
                        </p>
                    </div>
                </div>
                <div className="h-[calc(100%-80px)] rounded-md border border-dashed border-border bg-card/50">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <ProductInsumosBoard insumos={insumos || []} />
                    )}
                </div>
            </div>
        </div>
    );
}
