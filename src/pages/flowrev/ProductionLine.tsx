import { useState } from "react";
import { ProductInsumosBoard } from "@/components/flowrev/kanban/ProductInsumosBoard";
import { useDashboardStats, useProdutos, useCreateEdicao, useSyncInsumos } from "@/hooks/useFlowrev";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { Insumo } from "@/types/flowrev";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
                .select(`
            *,
            produto:flowrev_produtos(*)
        `)
                .eq('mes', mes)
                .eq('ano', ano);

            if (edicoesError) throw edicoesError;
            const edicoesIds = edicoes?.map(e => e.id) || [];

            // We return empty if no editions, but we need the empty structure
            if (edicoesIds.length === 0) return { insumos: [], edicoes: [] };

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
            return { insumos: insumos as Insumo[], edicoes };
        }
    });
}

export default function ProductionLine() {
    const { data: allData, isLoading: loadingInsumos, refetch } = useAllInsumosOfMonth();
    const { data: produtos, isLoading: loadingProdutos, error: produtosError } = useProdutos();

    // Actions
    const { mutate: createEdicao, isPending: creatingEdicao } = useCreateEdicao();
    const { mutate: syncInsumos, isPending: syncingInsumos } = useSyncInsumos();

    const handleCreateEdicao = (produtoId: string) => {
        const now = new Date();
        createEdicao({
            produtoId,
            mes: now.getMonth() + 1,
            ano: now.getFullYear()
        }, {
            onSuccess: () => {
                toast.success("Edição criada com sucesso!");
                refetch();
            },
            onError: () => toast.error("Erro ao criar edição.")
        });
    };

    const handleSyncInsumos = (edicaoId: string) => {
        syncInsumos(edicaoId, {
            onSuccess: (data) => {
                toast.success(`${data.count} insumos sincronizados/criados!`);
                refetch();
            },
            onError: () => toast.error("Erro ao sincronizar insumos.")
        });
    };

    if (loadingInsumos || loadingProdutos) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const insumos = allData?.insumos || [];
    const edicoes = allData?.edicoes || [];

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex-1 w-full h-[calc(100vh-4rem)] p-4 md:p-8 pt-6 overflow-hidden flex flex-col">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold tracking-tight">Esteira de Produção</h2>
                    <p className="text-muted-foreground">
                        Gerencie insumos e acompanhe o fluxo de produção.
                    </p>
                </div>

                <Tabs defaultValue="todos" className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList className="w-full justify-start overflow-x-auto">
                            <TabsTrigger value="todos">Visão Geral (Todos)</TabsTrigger>
                            {produtos?.map(produto => (
                                <TabsTrigger key={produto.id} value={produto.id}>
                                    {produto.nome}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {!produtos || produtos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border p-8">
                            <p className="font-semibold text-lg">Nenhum produto encontrado.</p>
                            <p>Verifique se os dados foram inseridos corretamente no banco.</p>
                        </div>
                    ) : (
                        <>
                            <TabsContent value="todos" className="flex-1 h-full mt-0 overflow-hidden">
                                <div className="h-full rounded-md border border-dashed border-border bg-card/50">
                                    <ProductInsumosBoard insumos={insumos} />
                                </div>
                            </TabsContent>

                            {produtos.map(produto => {
                                const edicao = edicoes.find(e => e.produto_id === produto.id);
                                const insumosProduto = insumos.filter(i => i.edicao?.produto_id === produto.id);
                                const hasEdicao = !!edicao;
                                const hasInsumos = insumosProduto.length > 0;

                                return (
                                    <TabsContent key={produto.id} value={produto.id} className="flex-1 h-full mt-0 overflow-hidden">
                                        <div className="flex flex-col h-full">
                                            <div className="mb-4 flex gap-2">
                                                {!hasEdicao && (
                                                    <Button onClick={() => handleCreateEdicao(produto.id)} disabled={creatingEdicao}>
                                                        {creatingEdicao ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                                        Iniciar Edição para {produto.nome}
                                                    </Button>
                                                )}
                                                {hasEdicao && !hasInsumos && (
                                                    <Button variant="outline" onClick={() => handleSyncInsumos(edicao.id)} disabled={syncingInsumos}>
                                                        {syncingInsumos ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                                        Gerar Insumos Faltantes
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="h-full rounded-md border border-dashed border-border bg-card/50">
                                                {hasInsumos || hasEdicao ? (
                                                    <ProductInsumosBoard insumos={insumosProduto} />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                        <p>Nenhuma edição iniciada para este produto neste mês.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                );
                            })}
                        </>
                    )}
                </Tabs>
            </div >
        </div >
    );
}
