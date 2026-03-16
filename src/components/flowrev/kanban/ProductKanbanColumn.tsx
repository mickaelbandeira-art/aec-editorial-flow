import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { ProductInsumoCard } from "./ProductInsumoCard";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Insumo, InsumoStatus } from "@/types/flowrev";
import { Plus, X } from "lucide-react";
import { useCreateInsumo, useTiposInsumos } from "@/hooks/useFlowrev";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Column {
    id: InsumoStatus;
    title: string;
}

interface ProductKanbanColumnProps {
    column: Column;
    items: Insumo[];
    onItemClick?: (insumo: Insumo) => void;
    edicaoId?: string;
}

export function ProductKanbanColumn({ column, items, onItemClick, edicaoId }: ProductKanbanColumnProps) {
    const itemsIds = useMemo(() => items.map((item) => item.id), [items]);
    const { mutate: createInsumo, isPending: isCreating } = useCreateInsumo();
    const { data: tiposInsumo } = useTiposInsumos();

    // Quick Add State
    const [isAdding, setIsAdding] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState<string>("");

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

    const handleAddCard = () => {
        // Use selected type or fallback to the first available if not selected
        const typeToUseId = selectedTypeId || tiposInsumo?.[0]?.id;
        const typeToUseObj = tiposInsumo?.find(t => t.id === typeToUseId);

        // If user didn't type a title, use the Type Name as the title
        const finalTitle = newCardTitle.trim() || typeToUseObj?.nome;

        if (!finalTitle) {
            // Should theoretically not happen if types are loaded, but safety first
            return;
        }

        if (!edicaoId) {
            toast.error("Edição não identificada.");
            return;
        }

        createInsumo({
            titulo: finalTitle,
            edicaoId: edicaoId,
            status: column.id,
            tipoInsumoId: typeToUseId
        }, {
            onSuccess: () => {
                toast.success("Cartão criado!");
                setNewCardTitle("");
                // setSelectedTypeId(""); // Optional reset
            },
            onError: () => {
                toast.error("Erro ao criar cartão.");
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddCard();
        }
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-[300px] h-full rounded-none flex flex-col bg-slate-100 border-2 border-slate-900 border-dashed"
            ></div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            id={column.id}
            className={`column min-w-[280px] w-[300px] h-full rounded-none flex flex-col border-2 border-slate-900 bg-slate-50 p-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-transform`}
        >
            <CardHeader className="p-3 pb-2 bg-transparent border-none">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-3 w-full">
                        <span>{column.title}</span>
                        <span className="flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-none bg-slate-900 text-white shadow-[2px_2px_0_0_rgba(203,213,225,1)] text-[10px] font-bold border-2 border-slate-900">
                            <span>{items.length}</span>
                        </span>
                    </CardTitle>
                </div>
            </CardHeader>

            <ScrollArea className="flex-1 px-2">
                <div className="flex flex-col gap-2 pb-2">
                    <SortableContext items={itemsIds}>
                        {items.map((item) => (
                            <ProductInsumoCard
                                key={item.id}
                                insumo={item}
                                tipo={item.tipo_insumo}
                                onClick={() => onItemClick?.(item)}
                            />
                        ))}
                    </SortableContext>
                </div>
            </ScrollArea>

            {edicaoId && (
                <div className="px-2 pb-2 pt-1">
                    {!isAdding ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 w-full text-left text-slate-800 bg-white hover:bg-slate-100 p-2 rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] text-[10px] font-black uppercase tracking-wider transition-all hover:translate-y-px hover:shadow-none"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Novo Cartão</span>
                        </button>
                    ) : (
                        <div className="bg-white rounded-none p-2 border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] animate-in fade-in zoom-in-95 duration-100">
                            <div className="mb-2">
                                <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                                    <SelectTrigger className="h-8 text-[10px] uppercase font-bold tracking-wider rounded-none border-2 border-slate-900 w-full mb-2">
                                        <SelectValue placeholder="Selecione o tipo..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                                        {tiposInsumo?.map((tipo) => (
                                            <SelectItem key={tipo.id} value={tipo.id} className="text-[10px] font-bold uppercase tracking-wider cursor-pointer focus:bg-slate-100">
                                                {tipo.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <textarea
                                    autoFocus
                                    className="w-full text-sm font-bold resize-none border-2 border-slate-200 focus:border-slate-900 p-2 placeholder:text-slate-400 min-h-[60px] transition-colors"
                                    placeholder="INSIRA UM TÍTULO PARA ESTE CARTÃO..."
                                    value={newCardTitle}
                                    onChange={e => setNewCardTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Button
                                    size="sm"
                                    className="h-8 bg-slate-900 hover:bg-slate-800 text-white rounded-none border-2 border-slate-900 text-[10px] uppercase font-black tracking-wider flex-1"
                                    onClick={handleAddCard}
                                    disabled={isCreating}
                                >
                                    {isCreating ? "Adicionando..." : "Salvar"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-slate-900 rounded-none border-2 border-slate-900 hover:bg-slate-100 shrink-0"
                                    onClick={() => setIsAdding(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
