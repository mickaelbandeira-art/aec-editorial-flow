import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Image as ImageIcon,
    Video,
    MessageSquare,
    Paperclip,
    Clock
} from "lucide-react";
import { Insumo, TipoInsumo } from "@/types/flowrev";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProductInsumoCardProps {
    insumo: Insumo;
    tipo: TipoInsumo | undefined;
    onClick?: () => void;
}

export function ProductInsumoCard({ insumo, tipo, onClick }: ProductInsumoCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: insumo.id,
        data: {
            type: "Item",
            item: { id: insumo.id, ...insumo }, // Legacy compatibility if needed
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-50 bg-slate-100 border-2 border-slate-900 border-dashed rounded-none h-[140px]"
            />
        );
    }

    const getIcon = () => {
        // Logic to determine icon based on type name or slug if available
        // For now defaulting to FileText
        return <FileText className="h-4 w-4" />;
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick} id={`card-${insumo.id}`} data-prazo={insumo.data_limite}>
            <div className="card group relative bg-white rounded-none border-2 border-slate-900 p-[10px] mb-[8px] cursor-grab transition-transform duration-200 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:shadow-none active:translate-y-0 active:cursor-grabbing">

                {/* Neo-brutalist label */}
                <div className="h-[8px] w-[40px] border-2 border-slate-900 mb-2 bg-green-500" title={tipo?.nome || "Etiqueta"}></div>

                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="card-title text-[11px] font-black uppercase tracking-wider text-slate-900 leading-tight">
                        <span>{insumo.titulo || tipo?.nome || "Sem Título"}</span>
                    </h3>
                </div>

                {/* Metadata Footer */}
                <div className="card-meta">
                    {insumo.data_limite && (() => {
                        const hoje = new Date();
                        const dataLimite = new Date(insumo.data_limite);
                        // Reset hours for accurate date comparison
                        hoje.setHours(0, 0, 0, 0);
                        dataLimite.setHours(0, 0, 0, 0);

                        let statusClass = "";

                        if (insumo.status === 'aprovado') {
                            statusClass = "status-concluido";
                        } else if (dataLimite < hoje) {
                            statusClass = "status-atrasado";
                        } else if (dataLimite.getTime() === hoje.getTime()) {
                            statusClass = "status-atencao";
                        }
                        // Tomorrow logic could be added here if desired (dataLimite <= tomorrow)

                        return (
                            <div className={`badge-date ${statusClass}`}>
                                <Clock className="h-3 w-3" />
                                <small className="date-text"><span>{format(new Date(insumo.data_limite), "dd MMM", { locale: ptBR })}</span></small>
                            </div>
                        );
                    })()}

                    {insumo.observacoes && (
                        <div className="flex items-center gap-1" title="Possui observações">
                            <MessageSquare className="h-3 w-3" />
                        </div>
                    )}

                    {insumo.anexos && insumo.anexos.length > 0 && (
                        <div className="flex items-center gap-1" title={`${insumo.anexos.length} anexos`}>
                            <Paperclip className="h-3 w-3" />
                            <span>{insumo.anexos.length}</span>
                        </div>
                    )}

                    {/* OK Badge if approved */}
                    {insumo.status === 'aprovado' && (
                        <div className="ml-auto bg-green-300 text-green-900 border-2 border-green-900 text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 leading-none shadow-[1px_1px_0_0_rgba(20,83,45,1)]">
                            OK
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
