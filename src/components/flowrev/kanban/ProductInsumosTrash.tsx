import { useDeletedInsumos, useRestoreInsumo } from "@/hooks/useFlowrev";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductInsumosTrashProps {
    edicaoId?: string;
}

export function ProductInsumosTrash({ edicaoId }: ProductInsumosTrashProps) {
    const { data: deletedInsumos, isLoading } = useDeletedInsumos(edicaoId);
    const { mutate: restoreInsumo, isPending: restoring } = useRestoreInsumo();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando lixeira...</p>
            </div>
        );
    }

    if (!deletedInsumos || deletedInsumos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/50 gap-4">
                <Trash2 className="w-12 h-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">Lixeira vazia</h3>
                <p className="text-muted-foreground text-center max-w-xs">
                    Insumos excluídos através do botão "Zerar Cards" aparecerão aqui.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="px-4 py-2 bg-muted/30 border rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">
                    {deletedInsumos.length} item(ns) na lixeira
                </span>
            </div>

            <ScrollArea className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {deletedInsumos.map((insumo) => (
                        <Card key={insumo.id} className="p-4 flex flex-col gap-3 border-2 shadow-none border-slate-200">
                            <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">
                                        {insumo.tipo_insumo?.nome || "Tipo não informado"}
                                    </div>
                                    <h4 className="font-semibold text-sm leading-tight">
                                        {insumo.titulo || insumo.tipo_insumo?.nome}
                                    </h4>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 gap-2 border-2 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_0_rgba(15,23,42,1)]"
                                    onClick={() => restoreInsumo(insumo.id)}
                                    disabled={restoring}
                                >
                                    {restoring ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
                                    Restaurar
                                </Button>
                            </div>
                            
                            {insumo.conteudo_texto && (
                                <p className="text-xs text-muted-foreground line-clamp-2 italic bg-muted/50 p-2 rounded">
                                    "{insumo.conteudo_texto}"
                                </p>
                            )}

                            <div className="mt-auto pt-2 border-t flex justify-between items-center text-[9px] uppercase font-bold text-muted-foreground">
                                <span>Excluído em:</span>
                                <span>
                                    {insumo.deleted_at 
                                        ? format(new Date(insumo.deleted_at), "dd MMM HH:mm", { locale: ptBR })
                                        : "-"}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
