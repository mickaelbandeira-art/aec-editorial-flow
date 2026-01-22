import { useState, useMemo } from "react";
import { ProductInsumosBoard } from "@/components/flowrev/kanban/ProductInsumosBoard";
import { useDashboardStats, useProdutos, useCreateEdicao, useAllInsumos } from "@/hooks/useFlowrev";
import { usePermissions } from "@/hooks/usePermission";
import { Loader2, Plus, RefreshCw, Lock } from "lucide-react";
import { Insumo } from "@/types/flowrev";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProductionLine() {
    const { data: allData, isLoading: loadingInsumos, refetch } = useAllInsumos();
    const { data: produtos, isLoading: loadingProdutos, error: produtosError } = useProdutos();
    const { user, canAccessProduct } = usePermissions();

    // Actions
    const { mutate: createEdicao, isPending: creatingEdicao } = useCreateEdicao();


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



    // Filter products based on permissions
    const filteredProdutos = useMemo(() => {
        if (!produtos || !user) return [];

        // Managers and Coordinators see all
        if (user.role === 'gerente' || user.role === 'coordenador') {
            return produtos;
        }

        // Others see only what they have access to
        return produtos.filter(p => canAccessProduct(p.slug));
    }, [produtos, user, canAccessProduct]);

    if (loadingInsumos || loadingProdutos) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const insumos = allData?.insumos || [];
    const edicoes = allData?.edicoes || [];

    // If user has no access to any product
    if (filteredProdutos.length === 0) {
        return (
            <div className="flex flex-col h-full bg-background p-8 items-center justify-center">
                <div className="max-w-md w-full">
                    <Alert variant="destructive" className="mb-4">
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Acesso Restrito</AlertTitle>
                        <AlertDescription>
                            Você não possui permissão para visualizar nenhum produto nesta esteira.
                            Entre em contato com seu coordenador.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

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
                            {/* "Visão Geral" only for Managers/Coordinators */}
                            {(user?.role === 'gerente' || user?.role === 'coordenador') && (
                                <TabsTrigger value="todos">Visão Geral (Todos)</TabsTrigger>
                            )}

                            {filteredProdutos.map(produto => (
                                <TabsTrigger key={produto.id} value={produto.id}>
                                    {produto.nome}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* "Visão Geral" Content - Only render if allowed */}
                    {(user?.role === 'gerente' || user?.role === 'coordenador') && (
                        <TabsContent value="todos" className="flex-1 h-full mt-0 overflow-hidden">
                            <div className="h-full rounded-md border border-dashed border-border bg-card/50">
                                <ProductInsumosBoard insumos={insumos} />
                            </div>
                        </TabsContent>
                    )}

                    {filteredProdutos.map(produto => {
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
                </Tabs>
            </div>
        </div>
    );
}
