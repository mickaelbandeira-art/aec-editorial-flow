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
    Calendar
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
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
            <Card className="cursor-grab active:cursor-grabbing bg-white border border-slate-200 border-l-4 border-l-blue-600 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 mb-3 group">
                <CardHeader className="p-3 pb-2">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex gap-2 items-start w-full">
                            <div className="mt-0.5 text-slate-400 shrink-0">
                                {getIcon()}
                            </div>
                            <h3 className="text-[0.95rem] font-semibold text-slate-800 leading-tight">
                                {tipo?.nome || "Insumo"}
                            </h3>
                        </div>
                        {insumo.status === 'aprovado' && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] px-1.5 py-0 h-5 shrink-0">
                                OK
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-3 pt-2">
                    {/* Metadata Chips */}
                    {/* Metadata Footer */}
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                        {insumo.data_limite && (
                            <div className={`flex items-center gap-1 ${new Date(insumo.data_limite) < new Date() && insumo.status !== 'aprovado'
                                ? "text-red-500 font-medium"
                                : ""
                                }`}>
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(insumo.data_limite), "dd/MMM", { locale: ptBR })}</span>
                            </div>
                        )}

                        {insumo.observacoes && (
                            <div className="flex items-center gap-1" title="Possui observações">
                                <MessageSquare className="h-3 w-3" />
                                <span>Obs</span>
                            </div>
                        )}

                        {insumo.anexos && insumo.anexos.length > 0 && (
                            <div className="flex items-center gap-1" title={`${insumo.anexos.length} anexos`}>
                                <Paperclip className="h-3 w-3" />
                                <span>{insumo.anexos.length}</span>
                            </div>
                        )}
                    </div>

                    {/* Status Bar (optional visual indicator) */}

                </CardContent>
            </Card>
        </div>
    );
}
