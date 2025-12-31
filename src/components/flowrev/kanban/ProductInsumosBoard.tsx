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
import { ProductInsumosCalendar } from "./ProductInsumosCalendar";
import { Insumo, InsumoStatus } from "@/types/flowrev";
import { useUpdateInsumoStatus, useUpdateInsumoContent, useUpdateInsumo } from "@/hooks/useFlowrev";
import { toast } from "sonner";
import { InsumoDetailsDialog } from "../insumo/InsumoDetailsDialog";
import { usePermissions } from "@/hooks/usePermission";
import { Calendar as CalendarIcon, Kanban as KanbanIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductInsumosBoardProps {
    insumos: Insumo[];
    edicaoId?: string;
}

const COLUMNS: { id: InsumoStatus, title: string }[] = [
    { id: 'nao_iniciado', title: 'Não Iniciado' },
    { id: 'em_preenchimento', title: 'Em Preenchimento' },
    { id: 'enviado', title: 'Enviado' },
    { id: 'em_analise', title: 'Em Análise' },
    { id: 'ajuste_solicitado', title: 'Ajuste Solicitado' },
    { id: 'aprovado', title: 'Aprovado' },
];

export function ProductInsumosBoard({ insumos, edicaoId }: ProductInsumosBoardProps) {
    const { mutate: updateStatus } = useUpdateInsumoStatus();
    const { mutate: updateContent } = useUpdateInsumoContent();
    const { mutate: updateInsumo } = useUpdateInsumo();

    const [activeItem, setActiveItem] = useState<Insumo | null>(null);
    const [selectedInsumoId, setSelectedInsumoId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');


    const [searchTerm, setSearchTerm] = useState('');

    const filteredInsumos = insumos.filter(i => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        return (
            i.titulo?.toLowerCase().includes(term) ||
            i.conteudo_texto?.toLowerCase().includes(term) ||
            i.id.toLowerCase().includes(term) ||
            i.tags?.some(tag => tag.nome.toLowerCase().includes(term)) ||
            i.responsaveis?.some(user => user.nome.toLowerCase().includes(term))
        );
    });

    const selectedInsumo = insumos.find(i => i.id === selectedInsumoId) || null;

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

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeInsumo = insumos.find(i => i.id === activeId);
        const overColumn = COLUMNS.find(c => c.id === overId);
        const newStatus = overColumn ? overColumn.id : null;

        if (!activeInsumo || !newStatus || activeInsumo.status === newStatus) return;

        // PERMISSION CHECK FOR DRAG
        // Bypass for Mickael
        if (user && user.email !== 'mickael.bandeira@aec.com.br') {
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
                    toast.error("Você não tem permissão para mover para este status.");
                    return;
                }
            }
        }

        updateStatus({
            insumoId: activeId as string,
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
        setSelectedInsumoId(insumo.id);
        setIsDialogOpen(true);
    };

    const handleSaveInsumo = async (updatedData: Partial<Insumo>) => {
        if (!selectedInsumo) return;

        // Update status if changed
        if (updatedData.status && updatedData.status !== selectedInsumo.status) {
            updateStatus({ insumoId: selectedInsumo.id, status: updatedData.status });
        }

        // Update generic fields (like data_limite)
        if (updatedData.data_limite !== selectedInsumo.data_limite) {
            updateInsumo({
                insumoId: selectedInsumo.id,
                updates: { data_limite: updatedData.data_limite }
            });
        }

        // Update content if changed
        // We compare against the current fresh data
        if (updatedData.conteudo_texto !== selectedInsumo.conteudo_texto || updatedData.observacoes !== selectedInsumo.observacoes) {
            await updateContent({ // AWAIT for async logic in child
                insumoId: selectedInsumo.id,
                conteudo_texto: updatedData.conteudo_texto !== undefined ? updatedData.conteudo_texto : undefined,
                observacoes: updatedData.observacoes !== undefined ? updatedData.observacoes : undefined
            }, {
                onSuccess: () => {
                    toast.success("Conteúdo salvo com sucesso!");
                },
                onError: () => {
                    toast.error("Erro ao salvar conteúdo.");
                }
            });
            // DO NOT close dialog here, allow user to keep editing
            return;
        }

        setIsDialogOpen(false);
    };

    const handleUpdateDate = (insumoId: string, newDate: Date) => {
        updateInsumo({
            insumoId,
            updates: { data_limite: newDate.toISOString() }
        }, {
            onSuccess: () => toast.success("Data atualizada!"),
            onError: () => toast.error("Erro ao mudar data.")
        });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center px-4 pb-2">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        id="input-pesquisa"
                        placeholder="Pesquisar cartões..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-3 text-xs gap-2 ${viewMode === 'board' ? 'bg-white shadow-sm font-semibold text-blue-600' : 'text-slate-500'}`}
                        onClick={() => {
                            setViewMode('board');
                            if (window.mostrarView) window.mostrarView('quadro');
                        }}
                    >
                        <KanbanIcon className="h-3.5 w-3.5" />
                        Quadro
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-3 text-xs gap-2 ${viewMode === 'calendar' ? 'bg-white shadow-sm font-semibold text-blue-600' : 'text-slate-500'}`}
                        onClick={() => {
                            setViewMode('calendar');
                            if (window.mostrarView) window.mostrarView('calendario');
                        }}
                    >
                        <CalendarIcon className="h-3.5 w-3.5" />
                        Calendário
                    </Button>
                </div>
            </div>

            {/* Hybrid Integration: Board is always rendered here, but hidden via JS when Calendar is active */}
            <div id="board-view" className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ display: viewMode === 'board' ? 'flex' : 'none' }}>
                <DndContext
                    sensors={sensors}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                >
                    <div className="flex-1 flex gap-4 overflow-x-auto p-4 custom-scrollbar min-h-0">
                        {COLUMNS.map(col => (
                            <ProductKanbanColumn
                                key={col.id}
                                column={col}
                                items={filteredInsumos.filter(i => i.status === col.id)}
                                onItemClick={handleCardClick}
                                edicaoId={edicaoId}
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
            </div>

            <InsumoDetailsDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                insumo={selectedInsumo}
                onSave={handleSaveInsumo}
            />
        </div>
    );
}

// Global declaration for the external script
declare global {
    interface Window {
        mostrarView: (tipo: string) => void;
    }
}
