import { useState } from "react";
import {
    DndContext,
    DragEndEvent,
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
import { useUpdateInsumoStatus, useUpdateInsumoContent } from "@/hooks/useFlowrev";
import { toast } from "sonner";
import { InsumoDetailsDialog } from "../insumo/InsumoDetailsDialog";
import { usePermissions } from "@/hooks/usePermission";

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
    const { mutate: updateContent } = useUpdateInsumoContent();
    const [activeItem, setActiveItem] = useState<Insumo | null>(null);
    const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    const { user } = usePermissions();

    // ... inside onDragEnd
    const activeInsumo = insumos.find(i => i.id === activeId);
    const overColumn = COLUMNS.find(c => c.id === overId);
    const newStatus = overColumn ? overColumn.id : null;

    if (!activeInsumo || !newStatus || activeInsumo.status === newStatus) return;

    // PERMISSION CHECK FOR DRAG
    if (user) {
        if ((user.role === 'supervisor' || user.role === 'analista_pleno')) {
            // Supervisors can only move TO: nao_iniciado, em_preenchimento, enviado
            if (!['nao_iniciado', 'em_preenchimento', 'enviado'].includes(newStatus)) {
                toast.error("Você não tem permissão para mover para este status.");
                return;
            }
        }
        if (user.role === 'analista') {
            // Analistas can only move TO: em_analise, ajuste_solicitado, aprovado
            if (!['em_analise', 'ajuste_solicitado', 'aprovado'].includes(newStatus)) {
                // Maybe allow them to move back to processing? usually 'ajuste_solicitado' acts as that.
                // Strict interpretation of prompt:
                toast.error("Você não tem permissão para mover para este status.");
                return;
            }
        }
    }

    updateStatus({
        insumoId: activeId,
        status: newStatus
    }, {
        onSuccess: () => {
            toast.success(`Status atualizado para ${newStatus?.replace('_', ' ')}`);
        },
        onError: () => {
            toast.error("Erro ao atualizar status");
        }
    });
}

const handleCardClick = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    setIsDialogOpen(true);
};

const handleSaveInsumo = (updatedData: Partial<Insumo>) => {
    if (!selectedInsumo) return;

    // Update status if changed
    if (updatedData.status && updatedData.status !== selectedInsumo.status) {
        updateStatus({ insumoId: selectedInsumo.id, status: updatedData.status });
    }

    // Update content if changed
    if (updatedData.conteudo_texto !== selectedInsumo.conteudo_texto || updatedData.observacoes !== selectedInsumo.observacoes) {
        updateContent({
            insumoId: selectedInsumo.id,
            conteudo_texto: updatedData.conteudo_texto || undefined,
            observacoes: updatedData.observacoes || undefined
        }, {
            onSuccess: () => {
                toast.success("Conteúdo salvo com sucesso!");
            },
            onError: () => {
                toast.error("Erro ao salvar conteúdo.");
            }
        });
    }

    setIsDialogOpen(false);
};

return (
    <>
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
                        onItemClick={handleCardClick}
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

        <InsumoDetailsDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            insumo={selectedInsumo}
            onSave={handleSaveInsumo}
        />
    </>
);
}
