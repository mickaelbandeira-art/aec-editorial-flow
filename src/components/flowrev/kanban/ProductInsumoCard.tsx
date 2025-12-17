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
}

export function ProductInsumoCard({ insumo, tipo }: ProductInsumoCardProps) {
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
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all shadow-sm hover:shadow-md group">
                <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div className="flex gap-2 items-start">
                        <div className="mt-0.5 text-muted-foreground">
                            {getIcon()}
                        </div>
                        <CardTitle className="text-sm font-medium leading-snug">
                            {tipo?.nome || "Insumo"}
                        </CardTitle>
                    </div>
                    {insumo.status === 'aprovado' && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px] px-1.5 py-0 h-5">
                            OK
                        </Badge>
                    )}
                </CardHeader>

                <CardContent className="p-3 pt-2">
                    {/* Metadata Chips */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {insumo.data_limite && (
                            <div className={`flex items-center gap-1 text-xs ${new Date(insumo.data_limite) < new Date() && insumo.status !== 'aprovado'
                                    ? "text-destructive font-medium"
                                    : "text-muted-foreground"
                                }`}>
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(insumo.data_limite), "dd/MMM", { locale: ptBR })}</span>
                            </div>
                        )}

                        {insumo.observacoes && (
                            <div className="flex items-center gap-1 text-xs text-amber-500">
                                <MessageSquare className="h-3 w-3" />
                                <span>Obs</span>
                            </div>
                        )}

                        {insumo.anexos && insumo.anexos.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-blue-500">
                                <Paperclip className="h-3 w-3" />
                                <span>{insumo.anexos.length}</span>
                            </div>
                        )}
                    </div>

                    {/* Status Bar (optional visual indicator) */}
                    <div className={`h-1 w-full rounded-full bg-muted overflow-hidden mt-1`}>
                        <div className={`h-full ${insumo.status === 'aprovado' ? 'bg-success' :
                                insumo.status === 'ajuste_solicitado' ? 'bg-destructive' :
                                    insumo.status === 'enviado' ? 'bg-info' :
                                        'bg-primary/50'
                            }`} style={{ width: '100%' }}></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
