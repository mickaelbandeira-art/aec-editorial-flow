import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { FlowrevHeader } from "@/components/flowrev/Header";
import { useProdutos, useEdicaoAtual, useInsumos, useCreateEdicao, useSyncInsumos } from "@/hooks/useFlowrev";
import { usePermissions } from "@/hooks/usePermission";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProductInsumosBoard } from "@/components/flowrev/kanban/ProductInsumosBoard";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { DeadlineAlert } from "@/components/flowrev/DeadlineAlert";
import { ClearInsumosBtn } from "@/components/flowrev/ClearInsumosBtn";

export default function ProductPage() {
    const { slug } = useParams();
    const { data: produtos } = useProdutos();
    const { canAccessProduct, canPerformAction, user } = usePermissions();

    const produto = produtos?.find(p => p.slug === slug);

    // Fetch current edition for this product
    const { data: edicao, isLoading: loadingEdicao } = useEdicaoAtual(produto?.id || "");
    const { data: insumos, isLoading: loadingInsumos } = useInsumos(edicao?.id);

    // Mutations
    const { mutate: createEdicao, isPending: creatingEdicao } = useCreateEdicao();
    const { mutate: syncInsumos, isPending: syncingInsumos } = useSyncInsumos();

    const hasAccess = produto && canAccessProduct(produto.slug);
    const canManage = canPerformAction('manage_flow');

    if (produto && !hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
                <div className="p-4 bg-destructive/10 rounded-full">
                    <Lock className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-xl font-bold">Acesso Negado</h1>
                <p className="text-muted-foreground">Você não tem permissão para acessar o painel do produto "{produto.nome}".</p>
                <Button variant="outline" onClick={() => window.history.back()}>Voltar</Button>
            </div>
        );
    }

    if (!produto) {
        return <div className="p-8">Produto não encontrado</div>;
    }

    const isLoading = loadingEdicao || loadingInsumos;

    const [searchTerm, setSearchTerm] = useState("");

    const handleCreateEdicao = () => {
        const now = new Date();
        createEdicao({
            produtoId: produto.id,
            mes: now.getMonth() + 1,
            ano: now.getFullYear()
        }, {
            onSuccess: () => {
                toast.success("Edição criada com sucesso!");
            },
            onError: (error) => {
                console.error(error);
                toast.error("Erro ao criar edição. Verifique os tipos de insumo.");
            }
        });
    };

    const handleSyncInsumos = () => {
        if (!edicao) return;
        syncInsumos(edicao.id, {
            onSuccess: (data) => {
                if (data.count > 0) {
                    toast.success(`${data.count} insumos sincronizados/criados!`);
                } else {
                    toast.info("Todos os insumos já estão sincronizados.");
                }
            },
            onError: () => {
                toast.error("Erro ao sincronizar insumos.");
            }
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <FlowrevHeader
                title={produto.nome}
                subtitle={edicao ? `Edição de ${edicao.mes}/${edicao.ano}` : "Nenhuma edição ativa"}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <div className="p-6 h-[calc(100vh-5rem)] flex flex-col">
                <DeadlineAlert />
                {/* Defaulting to 'list' view as requested */}
                <Tabs defaultValue="list" className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <TabsList>
                            <TabsTrigger value="list">Lista</TabsTrigger>
                        </TabsList>

                        {!edicao && !isLoading && canManage && (
                            <Button onClick={handleCreateEdicao} disabled={creatingEdicao}>
                                {creatingEdicao ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando Edição...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Iniciar Edição do Mês
                                    </>
                                )}
                            </Button>
                        )}

                        {/* 'Gerar Insumos Faltantes' button removed per user request */}
                        {edicao && canManage && (
                            <ClearInsumosBtn edicaoId={edicao.id} variant="outline" />
                        )}
                    </div>

                    {isLoading || creatingEdicao ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            {creatingEdicao && <p className="text-muted-foreground">Criando edição e gerando insumos...</p>}
                        </div>
                    ) : !edicao ? (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
                            <h3 className="text-xl font-semibold mb-2">Nenhuma edição encontrada para este mês</h3>
                            <p className="text-muted-foreground mb-4">
                                {canManage
                                    ? "Inicie uma nova edição para começar a gerenciar os insumos."
                                    : "Aguarde o Supervisor iniciar a edição deste mês."}
                            </p>
                            {canManage && (
                                <Button onClick={handleCreateEdicao}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Iniciar Edição Agora
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <TabsContent value="list" className="flex-1 mt-0 h-full">
                                <Card className="p-4 h-full border-0 shadow-none bg-transparent">
                                    {/* Using Board component but rendered for 'Lista' tab. 
                                        User asked to remove "Board (Kanban)" button, implying they want the 'Lista' view 
                                        which in the screenshot is the board logic. */}
                                    <ProductInsumosBoard insumos={insumos || []} edicaoId={edicao.id} searchTerm={searchTerm} />
                                </Card>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
