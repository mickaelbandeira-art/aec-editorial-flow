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
import { useUpdateInsumoStatus, useUpdateInsumoContent, useUpdateInsumo, useTiposInsumos } from "@/hooks/useFlowrev";
import { toast } from "sonner";
import { InsumoDetailsDialog } from "../insumo/InsumoDetailsDialog";
import { usePermissions } from "@/hooks/usePermission";
import { Calendar as CalendarIcon, Kanban as KanbanIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductInsumosBoardProps {
    insumos: Insumo[];
    edicaoId?: string;
    searchTerm?: string;
}

const COLUMNS: { id: InsumoStatus, title: string }[] = [
    { id: 'nao_iniciado', title: 'Não Iniciado' },
    { id: 'em_preenchimento', title: 'Em Preenchimento' },
    { id: 'enviado', title: 'Enviado' },
    { id: 'em_analise', title: 'Em Análise' },
    { id: 'ajuste_solicitado', title: 'Ajuste Solicitado' },
    { id: 'aprovado', title: 'Aprovado' },
];

export function ProductInsumosBoard({ insumos, edicaoId, searchTerm = '' }: ProductInsumosBoardProps) {
    const { mutate: updateStatus } = useUpdateInsumoStatus();
    const { mutate: updateContent } = useUpdateInsumoContent();
    const { mutate: updateInsumo } = useUpdateInsumo();

    const { user } = usePermissions();
    const { data: tiposInsumos } = useTiposInsumos();

    // Filter States
    const [onlyMyTasks, setOnlyMyTasks] = useState(false);
    const [onlyDelayed, setOnlyDelayed] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('all');

    const [activeItem, setActiveItem] = useState<Insumo | null>(null);
    const [selectedInsumoId, setSelectedInsumoId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');
    const [activeMobileColumn, setActiveMobileColumn] = useState<InsumoStatus>('nao_iniciado');

    const filteredInsumos = insumos.filter(i => {
        // 1. Search Term
        const term = searchTerm.toLowerCase();
        const matchesSearch = !term || (
            i.titulo?.toLowerCase().includes(term) ||
            i.tipo_insumo?.nome?.toLowerCase().includes(term) ||
            i.conteudo_texto?.toLowerCase().includes(term) ||
            i.id.toLowerCase().includes(term) ||
            i.tags?.some(tag => tag.nome.toLowerCase().includes(term)) ||
            i.responsaveis?.some(u => u.nome.toLowerCase().includes(term))
        );
        if (!matchesSearch) return false;

        // 2. My Tasks
        if (onlyMyTasks && user) {
            const isMine = i.responsaveis?.some(r => r.id === user.id);
            if (!isMine) return false;
        }

        // 3. Delayed
        if (onlyDelayed) {
            const today = new Date().toISOString().split('T')[0];
            const isDelayed = i.status !== 'aprovado' && i.data_limite && i.data_limite < today;
            if (!isDelayed) return false;
        }

        // 4. Type
        if (selectedType !== 'all') {
            if (i.tipo_insumo?.id !== selectedType) return false;
        }

        return true;
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

    // user hook moved to top

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeInsumo = insumos.find(i => i.id === activeId);
        const overColumn = COLUMNS.find(c => c.id === overId);
        const newStatus = overColumn ? overColumn.id : null;

        if (!activeInsumo || !newStatus || activeInsumo.status === newStatus) return;

        // VALIDATION: Prevent moving empty cards to advanced stages
        // The card must have "written content" to proceed beyond 'em_preenchimento'
        if (['enviado', 'em_analise', 'ajuste_solicitado', 'aprovado'].includes(newStatus)) {
            if (!activeInsumo.conteudo_texto || !activeInsumo.conteudo_texto.trim()) {
                toast.error("O card não possui conteúdo escrito. Preencha antes de avançar.");
                return;
            }
        }

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
                // Analistas can only move TO: enviado, em_analise, ajuste_solicitado, aprovado
                if (!['enviado', 'em_analise', 'ajuste_solicitado', 'aprovado'].includes(newStatus)) {
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

        // Update checklist if changed
        if (updatedData.checklist) {
            updateInsumo({
                insumoId: selectedInsumo.id,
                updates: { checklist: updatedData.checklist }
            });
            // We return early to avoid closing dialog if it was just a checklist update (though onSave doesn't assume close, but we want to be safe)
            return;
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
            <div className="flex flex-col md:flex-row justify-between items-center px-4 pb-2 gap-2">

                {/* Filters Toolbar */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
                    {/* Meus Insumos Toggle */}
                    <div
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-none border-2 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all select-none shrink-0 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:-translate-y-px hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:translate-y-0 active:shadow-none",
                            onlyMyTasks ? "bg-blue-300 border-blue-900 text-blue-950 shadow-[2px_2px_0_0_rgba(30,58,138,1)]" : "bg-white border-slate-900 text-slate-900"
                        )}
                        onClick={() => setOnlyMyTasks(!onlyMyTasks)}
                    >
                        <span className={cn("w-2 h-2 rounded-none border-2 border-slate-900", onlyMyTasks ? "bg-blue-600" : "bg-white")} />
                        Meus
                    </div>

                    {/* Delayed Toggle */}
                    <div
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-none border-2 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all select-none shrink-0 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:-translate-y-px hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:translate-y-0 active:shadow-none",
                            onlyDelayed ? "bg-red-400 border-red-900 text-red-950 shadow-[2px_2px_0_0_rgba(127,29,29,1)] hover:shadow-[4px_4px_0_0_rgba(127,29,29,1)]" : "bg-white border-slate-900 text-slate-900"
                        )}
                        onClick={() => setOnlyDelayed(!onlyDelayed)}
                    >
                        <span className={cn("w-2 h-2 rounded-none border-2 border-slate-900", onlyDelayed ? "bg-white" : "bg-white")} />
                        Atrasados
                    </div>

                    {/* Type Filter */}
                    <div className="relative shrink-0">
                        <select
                            className="h-8 pl-3 pr-8 text-[10px] font-black uppercase tracking-widest bg-white border-2 border-slate-900 rounded-none shadow-[2px_2px_0_0_rgba(15,23,42,1)] focus:outline-none appearance-none cursor-pointer transition-all hover:-translate-y-px hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)]"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="all" className="font-bold">TODOS OS TIPOS</option>
                            {tiposInsumos?.map(tipo => (
                                <option key={tipo.id} value={tipo.id} className="font-bold">{tipo.nome.toUpperCase()}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900 text-[10px]">▼</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1 border-2 border-slate-900 rounded-none shrink-0 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                    <Button
                        variant={viewMode === 'board' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            "h-7 px-3 text-[10px] font-black uppercase tracking-widest gap-2 rounded-none border-2 border-transparent transition-all",
                            viewMode === 'board' 
                                ? "bg-slate-900 text-white shadow-none" 
                                : "bg-transparent text-slate-500 border-none hover:bg-slate-200 hover:text-slate-900 shadow-none"
                        )}
                        onClick={() => {
                            setViewMode('board');
                            if (window.mostrarView) window.mostrarView('quadro');
                        }}
                    >
                        <KanbanIcon className="h-3.5 w-3.5" />
                        Quadro
                    </Button>
                    <Button
                        variant={viewMode === 'calendar' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            "h-7 px-3 text-[10px] font-black uppercase tracking-widest gap-2 rounded-none border-2 border-transparent transition-all",
                            viewMode === 'calendar' 
                                ? "bg-slate-900 text-white shadow-none" 
                                : "bg-transparent text-slate-500 border-none hover:bg-slate-200 hover:text-slate-900 shadow-none"
                        )}
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

            {/* Hybrid Integration: Board is always rendered here, hidden via JS when Calendar is active */}
            <div id="board-view" className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ display: viewMode === 'board' ? 'flex' : 'none' }}>
                <DndContext
                    sensors={sensors}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                >
                    {/* Mobile Tabs / Pills */}
                    <div className="md:hidden overflow-x-auto pb-2 px-4 flex gap-2 shrink-0 custom-scrollbar">
                        {COLUMNS.map(col => (
                            <button
                                key={col.id}
                                onClick={() => setActiveMobileColumn(col.id)}
                                className={cn(
                                    "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                    activeMobileColumn === col.id
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {col.title}
                                <span className={cn(
                                    "ml-2 text-xs opacity-80",
                                    activeMobileColumn === col.id ? "text-blue-100" : "text-slate-400"
                                )}>
                                    {filteredInsumos.filter(i => i.status === col.id).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Mobile Board View (Single Column) */}
                    <div className="md:hidden flex-1 overflow-hidden px-2 pb-2">
                        {COLUMNS.filter(c => c.id === activeMobileColumn).map(col => (
                            <ProductKanbanColumn
                                key={col.id}
                                column={col}
                                items={filteredInsumos.filter(i => i.status === col.id)}
                                onItemClick={handleCardClick}
                                edicaoId={edicaoId}
                            />
                        ))}
                    </div>

                    {/* Desktop Board View (Horizontal Scroll) */}
                    <div className="hidden md:flex flex-1 gap-4 overflow-x-auto p-4 custom-scrollbar min-h-0">
                        {COLUMNS.map(col => (
                            <div key={col.id} className="shrink-0 h-full">
                                <ProductKanbanColumn
                                    column={col}
                                    items={filteredInsumos.filter(i => i.status === col.id)}
                                    onItemClick={handleCardClick}
                                    edicaoId={edicaoId}
                                />
                            </div>
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

            {/* Calendar View */}
            <div id="calendar-view" className="flex-1 min-h-0 overflow-hidden" style={{ display: viewMode === 'calendar' ? 'block' : 'none' }}>
                <ProductInsumosCalendar
                    insumos={filteredInsumos}
                    onUpdateDate={handleUpdateDate}
                    onInsumoClick={handleCardClick}
                />
            </div>

            {selectedInsumo && (
                <InsumoDetailsDialog
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    insumo={selectedInsumo}
                    onSave={handleSaveInsumo}
                />
            )}
        </div>
    );
}

// Global declaration for the external script
// Force redeploy
declare global {
    interface Window {
        mostrarView: (tipo: string) => void;
    }
}
