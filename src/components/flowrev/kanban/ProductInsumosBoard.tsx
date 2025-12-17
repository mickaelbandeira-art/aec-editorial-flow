import { useMemo, useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { ProductKanbanColumn } from "./ProductKanbanColumn";
import { ProductInsumoCard } from "./ProductInsumoCard";
import { Insumo, InsumoStatus } from "@/types/flowrev";
import { useUpdateInsumoStatus } from "@/hooks/useFlowrev";
import { toast } from "sonner";

interface ProductInsumosBoardProps {
    insumos: Insumo[];
}

const COLUMNS: { id: InsumoStatus, title: string }[] = [
    { id: 'nao_iniciado', title: 'Não Iniciado' },
    { id: 'em_preenchimento', title: 'Em Preenchimento' },
    { id: 'enviado', title: 'Enviado' },
    { id: 'em_analise', title: 'Em Análise' },
    { id: 'ajuste_solicitado', title: 'Ajuste Solicitado' },
    { id: 'aprovado', title: 'Aprovado' },
];

export function ProductInsumosBoard({ insumos }: ProductInsumosBoardProps) {
    const { mutate: updateStatus } = useUpdateInsumoStatus();
    const [activeItem, setActiveItem] = useState<Insumo | null>(null);

    // Local optimistic state could be added here, 
    // but for simplicity we rely on React Query invalidation from the hook

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 3 }
        })
    );

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Item") {
            setActiveItem(event.active.data.current.item as Insumo);
        }
    }

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeInsumo = insumos.find(i => i.id === activeId);

        // Found the column we dropped into
        const overColumn = COLUMNS.find(c => c.id === overId);

        // Or maybe we dropped onto another item in a different column
        const overInsumo = insumos.find(i => i.id === overId);
        const overInsumoStatus = overInsumo ? overInsumo.status : null;

        const newStatus = overColumn ? overColumn.id : overInsumoStatus;

        if (activeInsumo && newStatus && activeInsumo.status !== newStatus) {
            updateStatus({
                insumoId: activeId,
                status: newStatus
            }, {
                onSuccess: () => {
                    toast.success(`Status atualizado para ${newStatus.replace('_', ' ')}`);
                },
                onError: () => {
                    toast.error("Erro ao atualizar status");
                }
            });
        }
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto p-4 custom-scrollbar">
                {COLUMNS.map(col => (
                    <ProductKanbanColumn
                        key={col.id}
                        column={col}
                        items={insumos.filter(i => i.status === col.id)}
                    />
                ))}
            </div>
            {createPortal(
                <DragOverlay>
                    {activeItem && <ProductInsumoCard insumo={activeItem} tipo={activeItem.tipo_insumo} />}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
