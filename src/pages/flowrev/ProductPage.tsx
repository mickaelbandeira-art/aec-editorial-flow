import { useParams } from "react-router-dom";
import { FlowrevHeader } from "@/components/flowrev/Header";
import { useProdutos, useEdicaoAtual, useInsumos, useCreateEdicao, useSyncInsumos } from "@/hooks/useFlowrev";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProductInsumosBoard } from "@/components/flowrev/kanban/ProductInsumosBoard";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProductPage() {
    const { slug } = useParams();
    const { data: produtos } = useProdutos();

    const produto = produtos?.find(p => p.slug === slug);

    // Fetch current edition for this product
    const { data: edicao, isLoading: loadingEdicao } = useEdicaoAtual(produto?.id || "");
    const { data: insumos, isLoading: loadingInsumos } = useInsumos(edicao?.id);

    // Mutations
    const { mutate: createEdicao, isPending: creatingEdicao } = useCreateEdicao();
    const { mutate: syncInsumos, isPending: syncingInsumos } = useSyncInsumos();

    if (!produto) {
        return <div className="p-8">Produto não encontrado</div>;
    }

    const isLoading = loadingEdicao || loadingInsumos;

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
            />

            <div className="p-6 h-[calc(100vh-5rem)] flex flex-col">
                <Tabs defaultValue="board" className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <TabsList>
                            <TabsTrigger value="board">Board (Kanban)</TabsTrigger>
                            <TabsTrigger value="list">Lista</TabsTrigger>
                            <TabsTrigger value="details">Detalhes da Edição</TabsTrigger>
                        </TabsList>

                        {!edicao && !isLoading && (
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

                        {edicao && !isLoading && (!insumos || insumos.length === 0) && (
                            <Button onClick={handleSyncInsumos} disabled={syncingInsumos} variant="outline">
                                {syncingInsumos ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                Gerar Insumos Faltantes
                            </Button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : !edicao && !creatingEdicao ? (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
                            <h3 className="text-xl font-semibold mb-2">Nenhuma edição encontrada para este mês</h3>
                            <p className="text-muted-foreground mb-4">Inicie uma nova edição para começar a gerenciar os insumos.</p>
                            <Button onClick={handleCreateEdicao}>
                                <Plus className="mr-2 h-4 w-4" />
                                Iniciar Edição Agora
                            </Button>
                        </div>
                    ) : (
                        <>
                            <TabsContent value="board" className="flex-1 mt-0 h-full">
                                <div className="h-full border border-dashed border-border rounded-lg bg-card/50">
                                    {insumos && <ProductInsumosBoard insumos={insumos} />}
                                </div>
                            </TabsContent>
                            <TabsContent value="list">
                                <Card className="p-4">
                                    <ProductInsumosBoard insumos={insumos || []} />
                                </Card>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
