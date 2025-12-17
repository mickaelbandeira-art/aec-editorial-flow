import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { ProductInsumoCard } from "./ProductInsumoCard";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Insumo, InsumoStatus } from "@/types/flowrev";

interface Column {
    id: InsumoStatus;
    title: string;
}

interface ProductKanbanColumnProps {
    column: Column;
    items: Insumo[];
}

export function ProductKanbanColumn({ column, items }: ProductKanbanColumnProps) {
    const itemsIds = useMemo(() => items.map((item) => item.id), [items]);

    const { setNodeRef, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const statusColorMap: Record<InsumoStatus, string> = {
        nao_iniciado: "bg-status-nao-iniciado/10 border-status-nao-iniciado/20",
        em_preenchimento: "bg-status-em-preenchimento/10 border-status-em-preenchimento/20",
        enviado: "bg-status-enviado/10 border-status-enviado/20",
        em_analise: "bg-status-em-analise/10 border-status-em-analise/20",
        ajuste_solicitado: "bg-status-ajuste/10 border-status-ajuste/20",
        aprovado: "bg-status-aprovado/10 border-status-aprovado/20",
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-[300px] h-full rounded-xl flex flex-col bg-background/50 opacity-50 border-2 border-primary/20"
            ></div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`w-[300px] h-full rounded-xl flex flex-col border ${statusColorMap[column.id]}`}
        >
            <CardHeader className="p-3 border-b border-border/50 bg-card/30 rounded-t-xl sticky top-0 z-10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        {column.title}
                        <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-background/50 text-[10px] font-normal border border-border">
                            {items.length}
                        </span>
                    </CardTitle>
                </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-2">
                <div className="flex flex-col gap-2 pb-2">
                    <SortableContext items={itemsIds}>
                        {items.map((item) => (
                            <ProductInsumoCard key={item.id} insumo={item} tipo={item.tipo_insumo} />
                        ))}
                    </SortableContext>
                </div>
            </ScrollArea>
        </div>
    );
}
