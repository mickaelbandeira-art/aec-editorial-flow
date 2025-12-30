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
                className="opacity-50 bg-background border-2 border-primary/20 rounded-lg h-[140px]"
            />
        );
    }

    const getIcon = () => {
        // Logic to determine icon based on type name or slug if available
        // For now defaulting to FileText
        return <FileText className="h-4 w-4" />;
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick} id={`card-${insumo.id}`}>
            <div className="card group relative bg-white rounded-[8px] p-[10px] mb-[8px] cursor-grab transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.12)] hover:bg-[#f4f5f7] hover:shadow-[0_2px_5px_rgba(0,0,0,0.2)] active:cursor-grabbing">

                {/* Trello-like colored label */}
                <div className="h-[6px] w-[40px] rounded-[4px] mb-[5px] bg-[#61bd4f]" title={tipo?.nome || "Etiqueta"}></div>

                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="card-title text-[0.95rem] font-medium text-slate-800 leading-tight">
                        {insumo.titulo || insumo.id}
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
                                <small className="date-text">{format(new Date(insumo.data_limite), "dd MMM", { locale: ptBR })}</small>
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
                        <Badge variant="outline" className="ml-auto bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] px-1.5 py-0 h-4 leading-none">
                            OK
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}
