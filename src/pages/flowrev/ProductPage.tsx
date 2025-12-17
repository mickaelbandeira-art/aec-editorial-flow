import { useParams } from "react-router-dom";
import { FlowrevHeader } from "@/components/flowrev/Header";
import { useProdutos, useEdicaoAtual, useInsumos } from "@/hooks/useFlowrev";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProductInsumosBoard } from "@/components/flowrev/kanban/ProductInsumosBoard";
import { Loader2 } from "lucide-react";

export default function ProductPage() {
    const { slug } = useParams();
    const { data: produtos } = useProdutos();

    const produto = produtos?.find(p => p.slug === slug);

    // Fetch current edition for this product
    const { data: edicao, isLoading: loadingEdicao } = useEdicaoAtual(produto?.id || "");
    const { data: insumos, isLoading: loadingInsumos } = useInsumos(edicao?.id);

    if (!produto) {
        return <div className="p-8">Produto não encontrado</div>;
    }

    const isLoading = loadingEdicao || loadingInsumos;

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
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                                    <p>Lista de insumos (TODO)</p>
                                </Card>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
